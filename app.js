const express = require('express');
const axios = require('axios');

const app = express();


app.listen(process.env.PORT || 3000, function(req, res) {
  console.log("Server started at port 3000");

});

app.use(express.static("public"));
app.set('view engine', 'ejs');

const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

}


function client(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
  return oAuth2Client;

}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({
    version: 'v3',
    auth
  });
  drive.files.list({
    q: "mimeType= 'application/vnd.google-apps.document'",
    pageSize: 100,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }

  });
}


app.get("/", function(req, res) {

  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    else {
      authorize(JSON.parse(content), listFiles);
      const oAuth2Client = client(JSON.parse(content), listFiles);
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      res.render("login", {
        url: authUrl
      });

    }
  });


  app.get("/index", function(req, res) {

    const code = req.query.code;

    function authorize(credentials, callback) {
      const {
        client_secret,
        client_id,
        redirect_uris
      } = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);



      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);



        });

        callback(oAuth2Client);
        redirect();

      });

    }


    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), listFiles);


    });

    function redirect() {
      res.redirect("/docs");
    }
  });




});


app.get("/docs", function(req1, res1) {


  fs.readFile('token.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    const token = JSON.parse(content).access_token;

    axios
      .get("https://www.googleapis.com/drive/v3/files?corpora=user&includePermissionsForView=published&q=mimeType%20%3D%20'application%2Fvnd.google-apps.document'&key=AIzaSyDZHo533A3aaJ-xqEHV9iCe9v7_GAdYEhI", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const files = res.data.files;

        res1.render("docs", {
          files: files
        });
      })
      .catch(error => {
        console.error(error);
      });
  });

});


app.get("/file/:fileId", function(req1, res1) {



  const fileId = req1.params.fileId;
  const url = "https://www.googleapis.com/drive/v3/files/" + fileId + "/export?mimeType=text%2Fhtml&key=AIzaSyDZHo533A3aaJ-xqEHV9iCe9v7_GAdYEhI";

  fs.readFile('token.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    const token = JSON.parse(content).access_token;


    axios
      .get(url, {

        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        res1.render("data", {
          data: res.data
        });
      })
      .catch(error => {
        console.error(error);
      });

  });
});
