var http = require('http');
const { Client } = require('pg');


const client = new Client({
    user: 'postgres',
    host: '10.2.0.193',
    database: 'postgres',
    password: 'admin123',
    port: 5432,
});

//Connexion à la base de donnée
client.connect().then(() => { console.log('Connected to database'); });

//Création du serveur
const server = http.createServer();
server.on('request', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    let data = [];
    let action = request.url.split('/').slice(-1)[0];
    let responseData;

    request.on("data", (chunk) => {
        data.push(chunk);
        if (data.length > 1e6) {
            request.destroy();
        }
    }).on("end", async () => {

        data = (data == null) ? null : Buffer.concat(data).toString();
        if (request.method == 'POST') {
            let jsonContent
            switch (action) {
                case "inscrire":
                    if (checkey((jsonContent = tryParseJSON(data)), ["name", "password"])) {
                        if (await findUser(jsonContent.name, jsonContent.password) == null) {
                            let asWork = await addUser(jsonContent.name, jsonContent.password);
                            response.statusCode = asWork ? 200 : 500;
                            responseData = asWork ? "User created" : "An error as occurred while creating user"
                        }
                        else {
                            response.statusCode = 400;
                            responseData = "User already exist";
                        }
                        break;
                    }
                    else {
                        response.statusCode = 400;
                        responseData = "Bad JSON";
                    }
                    break;

                case "connecter":
                    if (checkey((jsonContent = tryParseJSON(data)), ["name", "password"])) {
                        if ((res = await findUser(jsonContent.name, jsonContent.password, ["score, id"])) == null) {
                            response.statusCode = 400;
                            responseData = "Aucun compte n'est associé à ce nom et mot de passe. Veuillez vous inscrire";
                        }
                        else {
                            response.statusCode = 200;
                            response.statusMessage = "User connected";
                            responseData = JSON.stringify(res);
                        }
                    }
                    else {
                        response.statusCode = 400;
                        responseData = "Bad JSON";
                    }
                    break;
                case "update":
                    if (checkey((jsonContent = tryParseJSON(data)), ["id", "score"])) {
                        let asWork = await updateUser(jsonContent.id, jsonContent.score);
                        response.statusCode = asWork ? 200 : 400;
                        responseData = ((asWork) ? "Score updated" : "An error as occurred while updating score");
                    }
                    else {
                        response.statusCode = 400;
                        responseData = "Bad JSON";
                    }
                    break;
                default:
                    response.statusCode = 404;
                    responseData = "Bad URL"
                    break;

            }
        }
        response.end(responseData);
    })
}).listen(8080);



async function findUser(name, password, columns) {
    let queryArgs = columns == null ? 'id' : columns.toString();

    return await client.query(`Select ${queryArgs} from login where name = $1 and password = $2`, [name, password])
        .then((res) => {
            return res.rowCount != 0 ? { id: res.rows[0]["id"], score: res.rows[0]["score"] } : null;
        })
        .catch((err) => {
            console.log('err');
        });
}

async function addUser(name, password) {
    return await client.query('insert into login (name, password) values ($1, $2)', [name, password])
        .then((res) => {
            return res.rowCount != 0;
        })
        .catch((err) => {
            console.log('err');
        });
}

async function updateUser(id, score) {
    return await client.query('update login set score = $1 where id = $2', [score, id])
        .then((res) => {
            return res.rowCount != 0;
        })
        .catch((err) => {
            console.log('err');
        });
}

//Vérifie si le json est valide
function tryParseJSON(jsonString) {
    let value = null;
    try {
        var json = JSON.parse(jsonString);
        if (json && typeof json === "object") {value = json;}
    }
    catch (e) { }
    return value;
    
}

//Vérifie si les clés de l'objet json correspondent aux clés désirées 
function checkey(json, keys) {
    let checkey = false;
    if (json) {
        checkey = true;
        for (let i = 0; i < keys.length; i++) {
            checkey = json[keys[i]] != null;
            if (!checkey) break;
        }
    }
    return checkey;
}