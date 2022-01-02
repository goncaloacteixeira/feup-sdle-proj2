# SDLE Project

SDLE Project for group T&lt;n&gt;G&lt;p&gt;&lt;q&gt;.

Group members:

1. &lt;first name&gt; &lt;family name&gt; (&lt;email address&gt;)
2. &lt;first name&gt; &lt;family name&gt; (&lt;email address&gt;)
3. &lt;first name&gt; &lt;family name&gt; (&lt;email address&gt;)
4. &lt;first name&gt; &lt;family name&gt; (&lt;email address&gt;)

## Instructions

- On `bootstrap/`
	- run `docker-compose up`
	
- On `server/`
	- run `npm i`
	- run `npm start`
	
	If you want a new instance for the server in detached mode, add the following environment variables:
	- MODE=DETACHED
	- PORT=\<port>
	- APP_USERNAME=\<username>
	- PEERID=\<key.json>
	These variables can be added on the command or in a .env file

- On `client/`
   	- run `npm i`
   	- run `npm start`
   	

