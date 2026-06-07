
import pandas as pd
import numpy as np
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostRegressor
from ngboost import NGBRegressor
from sklearn.linear_model import RidgeCV
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

def pentafecta_v3_pipeline():
    print("🚀 Starting Pentafecta v3 Engine...")
    
    # 1. Load Data
    train = pd.read_csv('train.csv')
    test = pd.read_csv('test.csv')
    y_train_log = np.log1p(train['demand'].values)

    # 2. Advanced Feature Engineering (36 Features)
    def apply_engineering(df_in, train_ref):
        df = df_in.copy()
        
        # Spatial Stats
        geo_stats = train_ref.groupby('geohash')['demand'].agg(['mean', 'std', 'max']).fillna(0)
        geo_stats.columns = ['geo_mean', 'geo_std', 'geo_max']

        # Behavioral Clustering (15 Clusters)
        kmeans = KMeans(n_clusters=15, random_state=42, n_init=10)
        geo_stats['behavior_cluster'] = kmeans.fit_predict(StandardScaler().fit_transform(geo_stats))
        df = df.merge(geo_stats, on='geohash', how='left')

        # Temporal Features
        df['hour'] = df['timestamp'].apply(lambda x: int(x.split(':')[0]) if ':' in str(x) else 0)
        df['min_total'] = df['timestamp'].apply(lambda x: int(x.split(':')[0])*60 + int(x.split(':')[1]) if ':' in str(x) else 0)

        # Harmonic Cycles (24h, 12h, 6h)
        for p in [24, 12, 6]:
            df[f'sin_{p}h'] = np.sin(2 * np.pi * df['min_total'] / (p*60))
            df[f'cos_{p}h'] = np.cos(2 * np.pi * df['min_total'] / (p*60))

        # Density & Interactions
        density = df.groupby(['geohash', 'day', 'hour']).size().rename('density_proxy').reset_index()
        df = df.merge(density, on=['geohash', 'day', 'hour'], how='left')
        df['cluster_hour_interact'] = df['behavior_cluster'].astype(str) + "_H" + df['hour'].astype(str)
        df['temp_geo_interact'] = df['Temperature'] * df['geo_mean']
        df['relative_density'] = df['density_proxy'] / (df['geo_max'] + 1e-6)
        df['prophet_signal_full'] = df['geo_mean']

        # Categoricals
        cats = ['RoadType', 'LargeVehicles', 'Landmarks', 'Weather', 'behavior_cluster', 'cluster_hour_interact']
        for c in cats:
            df[c] = df[c].astype(str).replace('nan', 'Missing').astype('category')
        return df

    print("🛠️ Engineering features...")
    X_train = apply_engineering(train.drop('demand', axis=1), train)
    X_test = apply_engineering(test, train)
    
    features = [f for f in X_train.columns if f not in ['Index', 'geohash', 'timestamp']]
    cat_features = [c for c in features if X_train[c].dtype.name == 'category']

    # 3. Stacking Ensemble
    oof_preds = np.zeros((len(X_train), 4))
    test_preds = np.zeros((len(X_test), 4))
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    print("⚔️ Training Ensemble models...")
    for fold, (trn_idx, val_idx) in enumerate(kf.split(X_train)):
        print(f"  -> Fold {fold+1}")
        X_tr, X_val = X_train[features].iloc[trn_idx], X_train[features].iloc[val_idx]
        y_tr, y_val = y_train_log[trn_idx], y_train_log[val_idx]

        # Models
        m1 = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.03, verbose=-1).fit(X_tr, y_tr)
        m2 = CatBoostRegressor(iterations=1000, learning_rate=0.03, depth=7, verbose=0, cat_features=cat_features).fit(X_tr, y_tr)
        
        # Label Encoding for XGB/NGB
        X_tr_le = X_tr.copy(); X_val_le = X_val.copy(); X_te_le = X_test[features].copy()
        for c in cat_features:
            X_tr_le[c] = X_tr_le[c].cat.codes
            X_val_le[c] = X_val_le[c].cat.codes
            X_te_le[c] = X_te_le[c].cat.codes

        m3 = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.03).fit(X_tr_le, y_tr)
        m4 = NGBRegressor(n_estimators=300, learning_rate=0.02, verbose=False).fit(X_tr_le, y_tr)

        oof_preds[val_idx, 0] = m1.predict(X_val)
        oof_preds[val_idx, 1] = m2.predict(X_val)
        oof_preds[val_idx, 2] = m3.predict(X_val_le)
        oof_preds[val_idx, 3] = m4.predict(X_val_le)

        test_preds[:, 0] += m1.predict(X_test[features]) / 5
        test_preds[:, 1] += m2.predict(X_test[features]) / 5
        test_preds[:, 2] += m3.predict(X_te_le) / 5
        test_preds[:, 3] += m4.predict(X_te_le) / 5

    # Meta Stacker
    meta = RidgeCV(alphas=[0.1, 1.0, 10.0]).fit(oof_preds, y_train_log)
    final_test_preds = np.maximum(0, np.expm1(meta.predict(test_preds)))

    # Export
    pd.DataFrame({'Index': test['Index'], 'demand': final_test_preds}).to_csv('submission_pentafecta_v3.csv', index=False)
    print("✅ Pipeline Complete.")

if __name__ == '__main__':
    pentafecta_v3_pipeline()
