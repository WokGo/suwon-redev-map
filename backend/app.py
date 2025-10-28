from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/api/zones")
def zones():
    data = [
        {"id": "wooman1", "name": "우만1구역", "units": 2800},
        {"id": "wooman2", "name": "우만2구역", "units": 2700},
        {"id": "worldcup1", "name": "월드컵1구역", "units": 1500},
    ]
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
