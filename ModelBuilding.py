import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

# Load the dataset
data = pd.read_csv('Avalanche.csv')

# Preprocessing
data['tilt_magnitude'] = np.sqrt(data['tilt-x']**2 + data['tilt-y']**2 + data['tilt-z']**2)
data.drop(columns=['x','y','z', 'tilt-x', 'tilt-y', 'tilt-z', 'tilt'], inplace=True)
data.rename(columns={'Temperature': 'temperature', 'Humidity': 'humidity', 'Wind Speed': 'wind speed',
                     'Wind Direction': 'wind direction', 'Pressure': 'pressure'}, inplace=True)

# Feature selection
features = ['temperature', 'humidity', 'pressure', 'wind speed', 'wind direction']
label = ['tilt_magnitude']
X = data[features]
y = data[label]
data['tilt_magnitude'] = data['tilt_magnitude'].apply(lambda x: 0 if x < 10 else 1)
label = ['tilt_magnitude']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=23)

# Logistic Regression
clf = LogisticRegression(random_state=0)
clf.fit(X_train, y_train)

# Prediction
y_pred = clf.predict(X_test)

# Model evaluation
acc = accuracy_score(y_test, y_pred)
print("Logistic Regression model accuracy (in %):", acc * 100)

# Save the model
import pickle
with open('avalanche.pkl', 'wb') as f:
    pickle.dump(clf, f)
