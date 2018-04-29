var express = require('express');
var app = express();
const PORT = process.env.PORT || 5000
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = 'expand witness two word permit argue clarify invest entry eager wrestle bomb';

var mongoose = require ("mongoose");
var mongouristring = 
  process.env.MONGODB_URI

mongoose.connect(mongouristring, function (err, res) {
    if (err) { 
      console.log ('ERROR connecting to: ' + mongouristring + '. ' + err);
    } else {
      console.log ('Succeeded connected to: ' + mongouristring);
    }
});

var tokenMetadataSchema = new mongoose.Schema({
  },{strict:false});

var STORJ_EMAIL = process.env.STORJ_EMAIL;
var STORJ_PASSWORD = process.env.STORJ_PASSWORD;

var storjCredentials = {
    email: STORJ_EMAIL,
    password: STORJ_PASSWORD
};

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var storj = require('storj-lib');
var api = 'https://api.storj.io';
var client = storj.BridgeClient(api, { basicAuth: storjCredentials });
var fs = require('fs');
const uuidv4 = require('uuid/v4');


app.get('/build/contracts/:name', function(req, res){

    var fileName = req.params.name;
    
    
    console.log( "Requested file: %s", fileName);
    res.sendfile(fileName, { root: __dirname + "/build/contracts" } );

});

var server = app.listen(PORT, function () {

});


app.post('/files/upload', function(req, res) {

    var obj = {};
    console.log('body: ' + JSON.stringify(req.body));

    var TokenMetadata = mongoose.model('TokenMetadata', tokenMetadataSchema);

    var item = new TokenMetadata (req.body);

    item.save(function (err, item) {
        
        if (err) console.log (err)
        else{
            var uniqueId = item._id;
            res.status(200).send(uniqueId);
        }
    
    });
  

        /*var uniqueId = uuidv4();

        fs.writeFile("/tmp/" + uniqueId , JSON.stringify(req.body), function(err) {
        if(err) {
            return console.log(err + "\n" + uniqueId);
        }

        console.log("The file was saved! %s", uniqueId );

        res.status(200).send(uniqueId);

        
       
        console.log('Retrieving buckets...')
        // Step 1
        client.getBuckets(function(err, buckets) {
        if (err) {
            return console.error("ERR1 " + err.message);
        }
    
        // Step 1a) Use the first bucket
        var bucketId = buckets[0].id;
        console.log('Uploading file to: ', bucketId);
    
        // Step 1b) Path of file
    
        var filepath = "/tmp/" + uniqueId;
        console.log('Path of file: ', filepath);
    
        // Step 1c) Name of file
        var filename = uniqueId;
        console.log('Name of file: ', filename);
    
        // Step 2) Create a filekey with username, bucketId, and filename
        var filekey = getFileKey(STORJ_EMAIL, bucketId, filename);
    
        // Step 3) Create a temporary path to store the encrypted file
        var tmppath = filepath + '.crypt';
    
        // Step 4) Instantiate encrypter
        var encrypter = new storj.EncryptStream(filekey);
    
        // Step 5) Encrypt file
        fs.createReadStream(filepath)
            .pipe(encrypter)
            .pipe(fs.createWriteStream(tmppath))
            .on('finish', function() {
            console.log('Finished encrypting');
    
            // Step 6) Create token for uploading to bucket by bucketId
            client.createToken(bucketId, 'PUSH', function(err, token) {
                if (err) {
                    console.log('ERR2 ' + err.message);
                }

                console.log('Created token', token.token);
    
                // Step 7) Store the file
                console.log('Storing file in bucket...');
                client.storeFileInBucket(bucketId, token.token, tmppath,
                function(err, file) {
                    if (err) {
                        return console.log('ERR3 ' + err.message);
                    }
                    console.log('Stored file in bucket');
                    // Step 8) Clean up and delete tmp encrypted file
                    console.log('Cleaning up and deleting temporary encrypted file...');
                    fs.unlink(tmppath, function(err) {
                    if (err) {
                        return console.log('ERR4 ' + err);
                    }
                    console.log('Temporary encrypted file deleted');
                    });
    
                    console.log(`File ${filename} successfully uploaded to ${bucketId}`);
                    res.status(200).send(file);
                });
            });
            });
        });
        });*/
  });


  
  /**
   * Lists all files in buckets
   */
  app.get('/files/get/:metadataID', function(req, res) {

    var tokenMetadataAddress = req.params.metadataID;
    
    var TokenMetadata = mongoose.model('TokenMetadata', tokenMetadataSchema);

    TokenMetadata.findById(tokenMetadataAddress, function (err, product) {
        if (err) {
            console.log('error', err.message);
          }
        
        console.log(product);
        res.status(200).send(JSON.stringify(product));
     });

    

    /*
    separator();
    // Create object to hold all the buckets and files
    var bucketFiles = {};
  
    // Get buckets
    console.log('Getting buckets...')
    client.getBuckets(function(err, buckets) {
      if (err) {
        return console.log('error', err.message);
      }
  
      // Get all the buckets, and then return the files in the bucket
      // Assign files to bucketFiles
      async.each(buckets, function(bucket, callback) {
        console.log('bucket', bucket.id);
        client.listFilesInBucket(bucket.id, function(err, files) {
          if (err) {
            return callback(err);
          }
          // bucketFiles.myPictureBucket = [];
          bucketFiles[bucket.name] = files;
          callback(null);
        })
      }, function(err) {
        if (err) {
          return console.log('error');
        }
        console.log('bucketFiles retrieved: ', bucketFiles);
        res.status(200).send(bucketFiles);
      });
    });*/
  });

//TODO:     Add some kind of encryption here Everybody can call this.
app.get('/recycler/recycle/:id&:toAddress', function(req,res){

    var productId = req.params.id;
    var toAddress = req.params.toAddress;
    
    console.log(productId + ' ' + toAddress );

    var TruffleContract = require("truffle-contract");
    var EmineContract = null;
    var Web3 = require('web3');

    provider = new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/XbAOU5EG42nnsgPntAqU", 2);
    
    var web3 = new Web3(provider);

    web3.eth.getAccounts(function (error, accounts) {
        if (error) {
                console.log(error);
          }
        console.log(accounts);

        
        var EmineArtifact = require('./build/contracts/EMine.json');
        EmineContract = TruffleContract(EmineArtifact);
        EmineContract.setProvider(provider);
        var txHash = null;

        EmineContract.deployed().then(function (instance) {
            emineInstance = instance;
            return emineInstance.recycleProduct(productId, toAddress,  {from: accounts[0], gas: 2000000});
            
          }).then(function (result) {
            console.log("Returned Product!");
            res.status(200).send("Returned Product with ID: " + productId);
          }).catch(function (err) {
            console.log(err.message);
        });

    });
    
});

app.get("/recycler-app.apk", function(req, res){
    console.log( "Requested file: download apk");
    var file = __dirname + '/app-debug.apk';
    res.sendFile(file); // Set disposition and send it.
});

app.get('/:name', function(req, res){
    var fileName = req.params.name;

    console.log( "Requested file: %s", fileName);
    res.sendfile(fileName, { root: __dirname + "/src" } );

});

app.get('/:folder/:name', function(req, res){

    var fileName = req.params.name;
    var folderName = req.params.folder;
    
    console.log( "Requested file: %s", fileName);
    res.sendfile(fileName, { root: __dirname + "/src/" + folderName } );

});

app.get('/', function(req, res){

    res.sendfile("index.html", { root: __dirname + "/src" } );

});
