/**
 * Created by njanjanam on 20/05/2017.
 */
updateGalleriesInServer = function (editPropertyImages, propertyId, callback){
    if(!editPropertyImages||!propertyId)return;
    var tmp = [], arr=[];
    if(editPropertyImages.length) {
        for (var i = 0; i < editPropertyImages.length; i++) {
            if(editPropertyImages[i].name){//Means file is not coming from our traditional file uploader
                tmp.push(editPropertyImages[i])
            }else{//Else its insert properties form
                tmp.push({
                    name: editPropertyImages[i].file.original_name,
                    relative_url: editPropertyImages[i].relative_url,
                    url: editPropertyImages[i].secure_url
                })
            }


        }
    }
    console.log(tmp);
    Meteor.call('updateGalleries', [propertyId, tmp], callback);
}
updateGalleriesInProfile = function (editPropertyImages, callback){
    if(!editPropertyImages)return;
    var tmp = [], arr=[];
    if(editPropertyImages.length) {
        for (var i = 0; i < editPropertyImages.length; i++) {
            if(editPropertyImages[i].name){//Means file is not coming from our traditional file uploader
                tmp.push(editPropertyImages[i])
            }else{//Else its insert properties form
                tmp.push({
                    name: editPropertyImages[i].file.original_name,
                    relative_url: editPropertyImages[i].relative_url,
                    url: editPropertyImages[i].secure_url
                })
            }
        }
    }
    console.log(tmp);
    Meteor.call('updateGalleriesInUserProfile', tmp, callback);
}