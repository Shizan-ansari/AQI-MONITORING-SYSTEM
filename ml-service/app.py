from flask import Flask, request, jsonify
from sklearn.ensemble import RandomForestRegressor
import numpy as np

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json.get("history", [])

    if len(data) < 5:
        return jsonify({"error": "Not enough data"}), 400

    history = np.array(data)

    X = []
    y = []

    for i in range(len(history) - 1):
        X.append([history[i]])
        y.append(history[i + 1])

    X = np.array(X)
    y = np.array(y)

    model = RandomForestRegressor(n_estimators=100)
    model.fit(X, y)

    last_value = np.array([[history[-1]]])
    prediction = model.predict(last_value)[0]

    return jsonify({"prediction": round(float(prediction))})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
