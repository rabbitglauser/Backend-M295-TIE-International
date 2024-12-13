# README #

After cloning the repo, you need to install docker on your computer if it is not installed already. For that, follow the instructions according your OS here: https://docs.docker.com/engine/install/


## Running the database
Go to the root folder. Now, build the image with the following command:
``` 
docker build -t m295lb2 .
```
If you get the error message `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?` you need to start the docker Daemon:

```
sudo service docker start # WSL/Ubuntu
```

Now, you have got an images lying around which you can see by typing:
`docker images -a`.

From our images, we need to create a container:

```
docker run -d --name m295lb2 -p 5555:5432 m295lb2
```
We need exactly this port as it is hardcoded in the server that will connect to the database. Now, you're docker container is built and running. You can access the database via the command line interface as follows:

```
docker exec -it m295lb2 bash
```
You can now log into the database with the following command:

```
psql -U TIE tie-DB
```
where TIE is the username and tie-DB the database name as defined in the dockerfile. Now, you've successfully logged into the database. With the command `\dt+` or `SELECT * FROM users;`  you can see that there is already a table there that should match the frontend.

Now, you have a database with a table. In order to stop the container, you can run 
```
docker stop m295lb2
```

### Important
The next time you restart the container, you only need to run 
```
docker container start <container_name>
```
Then, all data that was stored in the database will still be there.

## Helpful Commands
Initialize the project by using `npm install`.

You can use the following predefined commands from the root folder:
```
npm start # run the code in watch mode
# any change on save will be automatically compiled and errors notified to the command line
npm run compile # compile the code and generate the JS files
```

## Debugging
If you are using Visual Studio Code, follow [this](https://code.visualstudio.com/docs/typescript/typescript-debugging) tutorial to configure a debugger for stepping through.
