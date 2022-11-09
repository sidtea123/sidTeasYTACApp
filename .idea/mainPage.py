import psycopg2
import socket
from flask import Flask, render_template, redirect, url_for, request, jsonify

app = Flask(__name__)

@app.route('/')
def gamePage():
    return render_template('gamePage.html')

@app.route('/ajaxStuff', methods=['POST','GET'])
def ajaxStuff():
    if request.method == 'POST':
        response = {
            "response": 200
        }

        responseJSON = request.get_json()
        saveInfo(responseJSON)
        return jsonify(response)

    # getting stuff
    info = getInfo()
    if len(info) == 0:
        serverData = {
            "bananas": 0,
            "buildings": [],
            "upgrades": []
        }
        createNewInfo(serverData)
        return jsonify(serverData)
    else:
        serverData = {
            "bananas": info[0][1],
            "buildings": info[0][2],
            "upgrades": info[0][3]
        }
        return jsonify(serverData)

def getInfo():
    conn, cur = initLink()
    IP = socket.gethostbyname(socket.gethostname())
    fetchQuery = f"""SELECT * FROM sitetable WHERE id = '{IP}'"""

    cur.execute(fetchQuery)
    val = cur.fetchall()
    closeLink(conn, cur)

    return val

def saveInfo(info):
    conn, cur = initLink()
    IP = socket.gethostbyname(socket.gethostname())
    buildList = "{"
    upList = "{"
    countA = 0
    countB = 0
    for building in info['buildings']:
        countA += 1
        buildList += str(building)
        if countA != len(info['buildings']):
            buildList += ', '
    for upgrade in info['upgrades']:
        countB += 1
        upList += str(upgrade)
        if countB != len(info['upgrades']):
            upList += ', '

    buildList += '}'
    upList += '}'
    updateQuery = f"""UPDATE sitetable SET bananas = {info['bananas']}, buildings = '{buildList}', upgrades = '{upList}' WHERE id = '{IP}'"""

    cur.execute(updateQuery)
    conn.commit()
    closeLink(conn, cur)

def createNewInfo(info):
    conn, cur = initLink()
    IP = socket.gethostbyname(socket.gethostname())
    insertQuery = f"INSERT INTO sitetable (id, bananas, buildings, upgrades) VALUES ('{IP}',%s,%s,%s)"
    cur.execute(insertQuery, list(info.values()))
    conn.commit()
    closeLink(conn, cur)

def clearTable():
    conn, cur = initLink()
    cur.execute("DELETE FROM sitetable")
    conn.commit()
    closeLink(conn, cur)

def initLink():
    conn = psycopg2.connect(user='postgres',
                            password='Wypg,C200$',
                            host='sidteas-database.cuae8oczg64i.us-east-1.rds.amazonaws.com',
                            port='5433',
                            database='postgres')
    cur = conn.cursor()
    return conn, cur

def closeLink(conn, cur):
    conn.close()
    cur.close()

if __name__ == '__main__':
    app.run(debug=True)
