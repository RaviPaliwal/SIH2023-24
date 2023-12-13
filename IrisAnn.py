import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.neural_network import MLPClassifier
import joblib as jb
import warnings as wn 
wn.filterwarnings('ignore')


# Load the Iris dataset
data = load_iris()
x = pd.DataFrame(data=data.data, columns=data.feature_names)
y = pd.DataFrame(data=data.target, columns=['O/P'])

# Rename the columns to match the request format
x = x.rename(columns={
    "sepal length (cm)": "sepal_length",
    "sepal width (cm)": "sepal_width",
    "petal length (cm)": "petal_length",
    "petal width (cm)": "petal_width"
})

# Split the data
from sklearn.model_selection import train_test_split
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=.2, random_state=0)

# Train the classifier
classifier = MLPClassifier(solver='sgd', verbose=True, n_iter_no_change=100, max_iter=400)
classifier.fit(x_train, y_train.values.ravel())

# Make predictions
ypred = classifier.predict(x_test)

# Calculate accuracy
from sklearn.metrics import accuracy_score
s = accuracy_score(ypred, y_test)
print(f"Accuracy score is {s}")

# Save the trained model
jb.dump(classifier, 'iris_model.pkl')
