# SDLE Project

SDLE Project for group T7G15.

Group members:
1. Ana Cruz (up201806460@edu.fe.up.pt)
2. André Nascimento (up201806461@edu.fe.up.pt)
3. Gonçalo Teixeira (up201806562@edu.fe.up.pt)
4. Gonçalo Pereira (up201705971@edu.fe.up.pt)


## Requirements

#### Just to run the application
- docker
- docker-compose

#### Testing and developing
- node >= 16.0
- npm
- docker
- docker-compose

## Instructions

- On `src/bootstrap/`
	- run `docker-compose up`
	
- On `src/`
	- insert the bootstrap IP on the docker-compose.yml file (it cannot be localhost or 127.0.0.1 since it's running on different containers)
	- run `docker-compose up --build`
	The application will be accessible on port 8080.


For development and testing purposes, if you want a new instance for the server in detached mode:
- On `src/server/`
    - run `npm i`
	- run `npm start`
	
	**Environment Variables**:  
        - MODE=DETACHED  
        - PORT=\<port>  
        - APP_USERNAME=\<username>  
        - PEERID=\<key.json>  
    
    These variables can be added on the command or in a .env file

	**available credentials for testing**:  
	    - username: `test1`  
	    - peerid: `./key1.json`  

	
