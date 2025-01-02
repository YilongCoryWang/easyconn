## Run mongo docker locally

https://www.mongodb.com/resources/products/compatibilities/docker

```
docker run --name mongodb -d -p 27017:27017 -v ${pwd}/mongodb:/data/db -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass dfda7a2cf273
docker exec -it mongodb bash
mongosh -u user -p pass
use <db>
db.<collection>.insertOne({name: "Yilong"})
db.<collection>.find()
show dbs
show collections
```

Programatically connect to your MongoDB instance on

```
mongodb://localhost:27017/easyconn
mongodb://user:pass@localhost:27017/easyconn

login to db
use easyconn
db.getUsers()
db.createUser({user: "user", pwd: "pass", roles: []})
db.grantRolesToUser( "user", ["readWrite"] )

//then can programatically connect mongodb in js code
mongoose.connect(DB_URL).then((conn) => console.log(conn));
```

## Mongo 5+ doesn't run on Virtualbox

https://stackoverflow.com/questions/70818543/mongo-db-deployment-not-working-in-kubernetes-because-processor-doesnt-have-avx

```
bcdedit /set hypervisorlaunchtype off
DISM /Online /Disable-Feature:Microsoft-Hyper-V
```

and reboot Windows11 host
