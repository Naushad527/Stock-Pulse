
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

def run_pentafecta_v3_pipeline(train_path='train.csv', test_path='test.csv'):
    # 1. Load Data
    print("Loading data...")
    train = pd.read_csv(train_path)
    test = pd.read_csv(test_path)
    y_train_log = np.log1p(train['demand'].values)

    # 2. Advanced Feature Engineering (Pentafecta v3 - 36 Features)
    def apply_v3_engineering(df_in, train_ref):
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
        df['prophet_signal_full'] = df['geo_mean'] # Placeholder
        
        # Categorical handling
        cats = ['RoadType', 'LargeVehicles', 'Landmarks', 'Weather', 'behavior_cluster', 'cluster_hour_interact']
        for c in cats:
            df[c] = df[c].astype(str).replace('nan', 'Missing').astype('category')
            
        return df

    print("Applying feature engineering...")
    X_train_v3 = apply_v3_engineering(train.drop('demand', axis=1), train)
    X_test_v3 = apply_v3_engineering(test, train)

    features = [f for f in X_train_v3.columns if f not in ['Index', 'geohash', 'timestamp']]
    cat_features = [c for c in features if X_train_v3[c].dtype.name == 'category']

    # 3. Stacking Execution
    oof_preds = np.zeros((len(X_train_v3), 4))
    test_preds = np.zeros((len(X_test_v3), 4))
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    for fold, (trn_idx, val_idx) in enumerate(kf.split(X_train_v3, y_train_log)):
        print(f"--- Fold {fold+1} ---")
        X_tr, X_val = X_train_v3[features].iloc[trn_idx], X_train_v3[features].iloc[val_idx]
        y_tr, y_val = y_train_log[trn_idx], y_train_log[val_idx]

        m_lgb = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.03, verbose=-1).fit(X_tr, y_tr)
        oof_preds[val_idx, 0] = m_lgb.predict(X_val)
        test_preds[:, 0] += m_lgb.predict(X_test_v3[features]) / 5

        m_cb = CatBoostRegressor(iterations=1000, learning_rate=0.03, depth=7, verbose=0, cat_features=cat_features).fit(X_tr, y_tr)
        oof_preds[val_idx, 1] = m_cb.predict(X_val)
        test_preds[:, 1] += m_cb.predict(X_test_v3[features]) / 5

        X_tr_le, X_val_le, X_te_le = X_tr.copy(), X_val.copy(), X_test_v3[features].copy()
        for c in cat_features:
            X_tr_le[c], X_val_le[c], X_te_le[c] = X_tr_le[c].cat.codes, X_val_le[c].cat.codes, X_te_le[c].cat.codes

        m_xgb = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.03).fit(X_tr_le, y_tr)
        oof_preds[val_idx, 2] = m_xgb.predict(X_val_le)
        test_preds[:, 2] += m_xgb.predict(X_te_le) / 5

        m_ngb = NGBRegressor(n_estimators=300, learning_rate=0.02, verbose=False).fit(X_tr_le, y_tr)
        oof_preds[val_idx, 3] = m_ngb.predict(X_val_le)
        test_preds[:, 3] += m_ngb.predict(X_te_le) / 5

    meta_model = RidgeCV(alphas=[0.1, 1.0, 10.0])
    meta_model.fit(oof_preds, y_train_log)
    final_preds = np.maximum(0, np.expm1(meta_model.predict(test_preds)))

    submission = pd.DataFrame({'Index': test['Index'], 'demand': final_preds})
    submission.to_csv('submission_pentafecta_v3.csv', index=False)
    print(f"DONE. OOF RMSE: {np.sqrt(mean_squared_error(y_train_log, meta_model.predict(oof_preds))):.6f}")

if __name__ == '__main__':
    run_pentafecta_v3_pipeline()

\\
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostRegressor
from ngboost import NGBRegressor
from sklearn.linear_model import RidgeCV
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error
import numpy as np
import pandas as pd
import time

# 0. Data Preparation (Ensuring v3 variables are defined correctly)
if 'results_full' in locals():
    prophet_full_df = pd.concat([fc.assign(geohash=geo) for geo, fc in results_full], axis=0)
    prophet_full_df.rename(columns={'yhat': 'prophet_signal_full'}, inplace=True)
    X_train_final_v3 = X_train_final_v2.drop(columns=['prophet_signal'], errors='ignore').merge(prophet_full_df, on=['geohash', 'ds'], how='left')
    X_test_final_v3 = X_test_final_v2.drop(columns=['prophet_signal'], errors='ignore').merge(prophet_full_df, on=['geohash', 'ds'], how='left')
elif 'all_forecasts' in locals() and len(all_forecasts) > 0:
    print("Using partial Prophet signals from Step 17 for Pentafecta v3.")
    prophet_full_df = pd.concat([fc.assign(geohash=geo) for geo, fc in all_forecasts.items()], axis=0)
    prophet_full_df.rename(columns={'yhat': 'prophet_signal_full'}, inplace=True)
    X_train_final_v3 = X_train_final_v2.drop(columns=['prophet_signal'], errors='ignore').merge(prophet_full_df, on=['geohash', 'ds'], how='left')
    X_test_final_v3 = X_test_final_v2.drop(columns=['prophet_signal'], errors='ignore').merge(prophet_full_df, on=['geohash', 'ds'], how='left')
else:
    print("Warning: No Prophet results found. Falling back to v2 signals.")
    X_train_final_v3 = X_train_final_v2.rename(columns={'prophet_signal': 'prophet_signal_full'})
    X_test_final_v3 = X_test_final_v2.rename(columns={'prophet_signal': 'prophet_signal_full'})

# Fill gaps with geo_mean for safety
if 'prophet_signal_full' in X_train_final_v3.columns:
    X_train_final_v3['prophet_signal_full'] = X_train_final_v3['prophet_signal_full'].fillna(X_train_final_v3['geo_mean'])
    X_test_final_v3['prophet_signal_full'] = X_test_final_v3['prophet_signal_full'].fillna(X_test_final_v3['geo_mean'])

# 1. Feature Prep for v3
features_v3 = [f for f in X_train_final_v3.columns if f not in ['Index', 'geohash', 'ds', 'timestamp']]
cat_features_v3 = [c for c in features_v3 if X_train_final_v3[c].dtype.name == 'category']

oof_preds_v3 = np.zeros((len(X_train_final_v3), 4))
test_preds_v3 = np.zeros((len(X_test_final_v3), 4))

kf = KFold(n_splits=5, shuffle=True, random_state=42)

print(f"🚀 Starting Pentafecta v3 Training on {len(features_v3)} features...")
start_time = time.time()

for fold, (trn_idx, val_idx) in enumerate(kf.split(X_train_final_v3)):
    fold_start = time.time()
    print(f"\n--- Processing Fold {fold+1}/5 ---")
    X_tr, X_val = X_train_final_v3[features_v3].iloc[trn_idx], X_train_final_v3[features_v3].iloc[val_idx]
    y_tr, y_val = y_train_log[trn_idx], y_train_log[val_idx]

    # Model 1: LightGBM
    m_lgbm = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.03, verbose=-1).fit(X_tr, y_tr)
    oof_preds_v3[val_idx, 0] = m_lgbm.predict(X_val)
    test_preds_v3[:, 0] += m_lgbm.predict(X_test_final_v3[features_v3]) / 5
    print("  - LightGBM complete")

    # Model 2: CatBoost
    m_cb = CatBoostRegressor(iterations=1000, learning_rate=0.03, depth=7, verbose=0, cat_features=cat_features_v3).fit(X_tr, y_tr)
    oof_preds_v3[val_idx, 1] = m_cb.predict(X_val)
    test_preds_v3[:, 1] += m_cb.predict(X_test_final_v3[features_v3]) / 5
    print("  - CatBoost complete")

    # Model 3: XGBoost
    X_tr_xgb, X_val_xgb, X_te_xgb = X_tr.copy(), X_val.copy(), X_test_final_v3[features_v3].copy()
    for c in cat_features_v3:
        X_tr_xgb[c], X_val_xgb[c], X_te_xgb[c] = X_tr_xgb[c].cat.codes, X_val_xgb[c].cat.codes, X_te_xgb[c].cat.codes
    m_xgb = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.03).fit(X_tr_xgb, y_tr)
    oof_preds_v3[val_idx, 2] = m_xgb.predict(X_val_xgb)
    test_preds_v3[:, 2] += m_xgb.predict(X_te_xgb) / 5
    print("  - XGBoost complete")

    # Model 4: NGBoost
    m_ngb = NGBRegressor(n_estimators=300, learning_rate=0.02, verbose=False).fit(X_tr_xgb, y_tr)
    oof_preds_v3[val_idx, 3] = m_ngb.predict(X_val_xgb)
    test_preds_v3[:, 3] += m_ngb.predict(X_te_xgb) / 5
    print(f"  - NGBoost complete. Fold time: {time.time() - fold_start:.1f}s")

# Level-2 Stacking Meta-Learner
meta_v3 = RidgeCV(alphas=[0.1, 1.0, 10.0])
meta_v3.fit(oof_preds_v3, y_train_log)
final_preds_v3_log = meta_v3.predict(test_preds_v3)

rmse_v3 = np.sqrt(mean_squared_error(y_train_log, meta_v3.predict(oof_preds_v3)))
print(f"\n✅ Pentafecta v3 Complete. Total time: {time.time() - start_time:.1f}s")
print(f"Final OOF RMSE: {rmse_v3:.6f}")

submission_v3 = pd.DataFrame({
    'Index': pd.read_csv('test.csv')['Index'],
    'demand': np.maximum(0, np.expm1(final_preds_v3_log))
})
submission_v3.to_csv('submission_pentafecta_v3.csv', index=False)
display(submission_v3.head())
