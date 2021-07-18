**To install the app**
run "meteor npm install" and do all necessary npm installs

**To run the app, execute the below commands**
MONGO_URL=mongodb://Kirill0611:Kirill0611@cluster0.3dlb0.mongodb.net:11461/sandboxdb
meteor run --settings ./settings/settings.json

**To find working s3 file upload code, go to imports/ui/templates/profile.js, line 742, you will see it, you can also search for "S3" on the same page and you will see more occurences**

**ToDo for Kirill**
- packages/flow-router and packages/meteor-dochead are currently handling SSR, but they need to be deleted and their functionality needs to be replaced with custom code as react automatically does SSR now.

**list of modified code**
- server/core/importer.js -> importPost 
- .deploy/mup.js
- settings/settings.json
- server/routes/social-config.js
- server/main.js


**How to deploy:**
1. Change the server URL in client/main.html
2. update .deploy/mup.js with all correct info
3. deploy using mup command "mup deploy"

**Packages used:**
Cropper used https://github.com/jonblum/meteor-cropper , https://github.com/fengyuanchen/cropper , https://fengyuanchen.github.io/cropper/
Camera plugin used: https://github.com/perak/meteor-camera/
FOR TOKEN GENERATION https://atmospherejs.com/hirespace/token-gen
https://github.com/Lepozepo/S3
https://themeteorchef.com/tutorials/using-the-email-package

**Known bugs associated with this project**
https://github.com/aldeed/meteor-autoform/issues/1582

**How to Run tests:**
Start 'meteor' in on terminal and run 'meteor npm run chimp-watch' in another.

**List of indexes to create**
Bids: {auctionId:auction._id,isArchived:false}


**Packages that can be deleted anytime**
kadira:blaze-layout
