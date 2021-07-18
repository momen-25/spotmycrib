/**
 * Created by srikanth681 on 09/12/2018. Dev 09, 2018
 */
import {Meteor} from "meteor/meteor";
import "../../imports/api/publications.js";
import bodyParser from 'body-parser';

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
var stripedhtml = "%3Cdiv+dir%3D%22ltr%22%3E%3Cimg+width%3D%220%22+height%3D%220%22+class%3D%22mailtrack-img%22+alt%3D%22%22+style%3D%22display%3Aflex%22+src%3D%22https%3A%2F%2Fmailtrack.io%2Ftrace%2Fmail%2F7706d8d19240906d922f05d56f1dc1b59d192efd.png%3Fu%3D2390507%22%3E%3Cdiv%3E%3C%2Fdiv%3E%3Cdiv%3E%3C%2Fdiv%3E%3Cdiv+class%3D%22gmail_quote%22%3E%3Cbr%3E%3Cu%3E%3C%2Fu%3E+%3Cdiv%3E+%3Cdiv+style%3D%22color%3Atransparent%3Bopacity%3A0%3Bfont-size%3A0px%3Bborder%3A0%3Bmax-height%3A1px%3Bwidth%3A1px%3Bmargin%3A0px%3Bpadding%3A0px%3Bborder-width%3A0px%21important%3Bdisplay%3Anone%21important%3Bline-height%3A0px%21important%22%3E%3Cimg+border%3D%220%22+width%3D%221%22+height%3D%221%22+src%3D%22http%3A%2F%2Fpost.spmailtechnol.com%2Fq%2FTHE-IBC7KjfGMZ2g91VIzA%7E%7E%2FAAFbhgA%7E%2FRgRdkLCdPVcDc3BjQgoAAB19r1slyyCmUhVzcmlrYW50aDY4MUBnbWFpbC5jb21YBAAAAAA%7E%22%3E%3C%2Fdiv%3E+%3Ctable+style%3D%22width%3A100%25%21important%3Bbackground-color%3A%23efefef%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd%3E+%3Ctable+align%3D%22center%22+style%3D%22font-family%3Aarial%3Bfont-size%3A12px%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd+style%3D%22width%3A2%25%22%3E%26nbsp%3B%3C%2Ftd%3E+%3Ctd+style%3D%22width%3A96%25%22%3E+%3Cdiv+style%3D%22max-width%3A800px%3Bmin-width%3A180px%22%3E+%3Ctable+id%3D%22m_-9020740417607596646background-table%22+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22margin%3A0%3Bpadding%3A0%3Bcolor%3A%23000000%3Bborder-top%3A10px+solid+%23efefef%3Bborder-bottom%3A10px+solid+%23efefef%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd%3E+%3Ctable+align%3D%22center%22+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22width%3A100%25%21important%3Bbackground-color%3Awhite%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd%3E+%3Ctable+align%3D%22center%22+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22width%3A100%25%21important%3Bbackground-color%3Awhite%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd%3E+%3Ctable+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22width%3A100%25%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd+height%3D%2214%22+style%3D%22height%3A14px%22%3E%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd%3E+%3Cimg+src%3D%22https%3A%2F%2Fc1.dmstatic.com%2F402%2Fi%2Femail_alerts%2Fdomain-logos%2Fdaft.png%22+border%3D%220%22+alt%3D%22+Daft.ie+%22+style%3D%22margin-left%3A20px%3Bwidth%3A119px%3Bheight%3A37px%3Bdisplay%3Ablock%22%3E+%3C%2Ftd%3E+%3Ctd+style%3D%22width%3A9px%3Bmargin%3A3px%22%3E%26nbsp%3B%3C%2Ftd%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bfont-size%3A14px%3Bpadding-right%3A30px%3Bcolor%3A%23333%3Btext-align%3Aright%22%3E+%3Cstrong+style%3D%22color%3A%23000%22%3E+Ad+enquiry+%3C%2Fstrong%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+height%3D%2214px%22+style%3D%22height%3A14px%22%3E%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3Ctable+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22width%3A100%25%3Bheight%3A10px%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd+height%3D%2210%22%3E%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3Ctable+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22width%3A100%25%3Bbackground-color%3Awhite%3Bmargin-left%3Aauto%3Bmargin-right%3Aauto%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd%3E+%3Ctable+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22margin-left%3A20px%3Bmargin-right%3A20px%3Bcolor%3A%23525252%3Bfont-family%3Aarial%3Bmin-width%3A120px%3Bmax-width%3A588px%3Bfont-size%3A14px%22%3E+%3Ctbody%3E%3Ctr%3E%3Ctd+height%3D%2220%22+style%3D%22height%3A20px%22%3E%3C%2Ftd%3E%3C%2Ftr%3E+%3Ctr%3E+%3Ctd%3E+%3Ctable+border%3D%220%22+cellpadding%3D%220%22+cellspacing%3D%220%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd%3E+%3Ctable+cellpadding%3D%220%22+cellspacing%3D%220%22+border%3D%220%22+style%3D%22width%3A100%25%3Bmargin-left%3Aauto%3Bmargin-right%3Aauto%3Bmin-width%3A120px%3Bmax-width%3A588px%22%3E+%3Ctbody%3E%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bfont-size%3A16px%3Bfont-weight%3Abold%3Bcolor%3A%23000%22%3E+From%3A+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bfont-size%3A16px%3Bpadding-bottom%3A10px%22%3E+Anthony+Bloomer+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bfont-size%3A16px%3Bfont-weight%3Abold%3Bcolor%3A%23000%22%3E+Email%3A+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bfont-size%3A16px%3Bpadding-bottom%3A10px%22%3E+%3Ca+href%3D%22mailto%3Aabloomer%40newrelic.com%22+style%3D%22color%3A%232953aa%3Btext-decoration%3Anone%22+target%3D%22_blank%22%3E+abloomer%40newrelic.com+%3C%2Fa%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bfont-size%3A16px%3Bfont-weight%3Abold%3Bcolor%3A%23000%22%3E+Phone+number%3A+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bfont-size%3A16px%3Bpadding-bottom%3A10px%22%3E+%3Ca+style%3D%22color%3A%23333%3Btext-decoration%3Anone%22+href%3D%22tel%3A0858278968%22+target%3D%22_blank%22%3E+0858278968+%3C%2Fa%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bfont-size%3A16px%3Bfont-weight%3Abold%3Bcolor%3A%23000%22%3E+Property%3A+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bfont-size%3A16px%3Bpadding-bottom%3A10px%22%3E+%3Ca+style%3D%22text-decoration%3Anone%3Bcolor%3A%232953aa%22+href%3D%22https%3A%2F%2Fwww.daft.ie%2F31041941%22+target%3D%22_blank%22%3E+Rockfield%2C+Dundrum%2C+Dublin+14+%3C%2Fa%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bfont-size%3A16px%3Bfont-weight%3Abold%3Bcolor%3A%23000%22%3E+Message%3A+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bfont-size%3A16px%22%3E+Hi%2C%3Cbr%3E+%3Cbr%3E+My+name+is+Anthony+Bloomer%2C+an+Engineering+professional+in+the+IT+industry.%3Cbr%3E+%3Cbr%3E+Currently%2C+I+am+working+for+a+large+multinational+company+called+New+Relic+as+a+Technical+Support+Engineer.%3Cbr%3E+%3Cbr%3E+This+property+you+are+advertising+is+ideal+since+it+is+very+close+to+my+workplace+in+Dublin+City+Centre.%3Cbr%3E+%3Cbr%3E+I+would+be+very+grateful+for+an+opportunity+to+view+the+room+in+person+and+chat+with+you+about+it.%3Cbr%3E+%3Cbr%3E+I+can+provide+references+and+letter+of+employment+on+request.%3Cbr%3E+%3Cbr%3E+I+do+look+forward+to+hearing+back+from+you.%3Cbr%3E+%3Cbr%3E+All+the+best%2C%3Cbr%3E+Anthony+Bloomer+%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3Cbr%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+height%3D%2215%22+style%3D%22height%3A15px%3Bborder-bottom%3A2px+solid+%23efefef%22%3E%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E%3Ctd+height%3D%2215%22+style%3D%22height%3A15px%22%3E%3C%2Ftd%3E%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bfont-size%3A16px%22%3E+Please+be+aware+of+suspicious+behaviour.+Never+wire+funds+through+a+third+party+money+transfer+service.+For+more+advice+please+see+%3Ca+style%3D%22text-decoration%3Anone%3Bcolor%3A%232953aa%22+href%3D%22https%3A%2F%2Fwww.daft.ie%2Fsafety-online%22+target%3D%22_blank%22%3E+Daft%26%2339%3Bs+Safety+Online+Guide+%3C%2Fa%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+height%3D%2215%22+style%3D%22height%3A15px%3Bborder-bottom%3A2px+solid+%23efefef%22%3E%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E%3Ctd+height%3D%2215%22+style%3D%22height%3A15px%22%3E%3C%2Ftd%3E%3C%2Ftr%3E+%3Ctr%3E%3Ctd+height%3D%2210%22+style%3D%22height%3A10px%22%3E%3C%2Ftd%3E%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bmargin%3A0px%3Bfont-size%3A16px%22%3E+Kind+Regards%2C+%3C%2Ftd%3E+%3C%2Ftr%3E%3Ctr%3E+%3Ctd+style%3D%22font-family%3Aarial%3Bcolor%3A%23333%3Bfont-size%3A16px%22%3E+The+Daft.ie+Team+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+height%3D%2220%22+style%3D%22height%3A20px%22%3E%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+style%3D%22color%3A%23777%3Bmargin%3A0px%3Bfont-family%3Aarial%3Bfont-size%3A11px%22%3E+Email%3A+%3Ca+href%3D%22mailto%3Asupportdesk%40daft.ie%22+style%3D%22font-weight%3Abold%3Btext-decoration%3Anone%3Bcolor%3A%232953aa%22+target%3D%22_blank%22%3E+supportdesk%40daft.ie+%3C%2Fa%3E+%7C+Daft+Media+Ltd.%2C+3rd+Floor+Latin+Hall%2C+Golden+Lane%2C+Dublin+8+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd+height%3D%2210%22+style%3D%22height%3A10px%22%3E%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3Ctr%3E+%3Ctd%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3C%2Fdiv%3E+%3C%2Ftd%3E+%3Ctd+style%3D%22width%3A2%25%22%3E%26nbsp%3B%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3C%2Ftd%3E+%3C%2Ftr%3E+%3C%2Ftbody%3E%3C%2Ftable%3E+%3Cimg+border%3D%220%22+width%3D%221%22+height%3D%221%22+alt%3D%22%22+src%3D%22http%3A%2F%2Fpost.spmailtechnol.com%2Fq%2Fokk99SCiCrBeq5auetPObw%7E%7E%2FAAFbhgA%7E%2FRgRdkLCdPlcDc3BjQgoAAB19r1slyyCmUhVzcmlrYW50aDY4MUBnbWFpbC5jb21YBAAAAAA%7E%22%3E+%3C%2Fdiv%3E+%3C%2Fdiv%3E%3Cdiv%3E%3Cbr%3E%3C%2Fdiv%3E%3Cbr%3E%3C%2Fdiv%3E";
// Add two middleware calls. The first attempting to parse the request body as
// JSON data and the second as URL encoded data.

Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: true } ) );
// Picker.middleware( bodyParser.raw( ) );
// Picker.middleware( bodyParser.text( ) );

  Picker.route('/lettingEnquiry2', function(params, req, res, next) {
      if(req.method!='POST') {
          res.writeHead(400, 'Bad Request');
          res.end();
          return false; // This is an invalid request
      }
      console.log('in lettingEnquiry2');

      let body = ''
      req.on('data', Meteor.bindEnvironment((data) => {
          body += data;
      })).on('end', Meteor.bindEnvironment(() => {
          // console.log(body)

          // keys = Object.keys(body)
          // json = keys[0];
          console.log("typeof body");
          console.log(typeof body);
          console.log(body);
          // console.log(typeof keys);
          // console.log(typeof json);
          // console.log(json);
          try{
              json = JSON.parse(body);
          }catch(e){
              console.log('Parse failed');
              console.log(e)
              res.writeHead(400, 'Bad Request');
              res.end();
              return;
          }

          if(!json){
              res.writeHead(400);
              res.end('Invalid input');
              return;
          }

          processEmail = processEmail.bind(this);
          let ret = processEmail(json);
          if(!ret.status ){
              res.writeHead(400);
              res.end('Invalid input. Error: '+ret.message);
              return;
          }

          res.writeHead(200);
          res.end('success');

    })
      )
  })
  Picker.route('/lettingEnquiry', function(params, req, res, next) {
    if(req.method!='POST') {
        res.writeHead(400, 'Bad Request');
        res.end();
        return false; // This is an invalid request
    }
    console.log('in lettingEnquiry');

    let json = {}
    if(req.body) {
        // console.log("req.body")
        // console.log(req.body)
        json = req.body;
        json = JSON.stringify(json);
        // console.log(typeof json);
        // console.log(json);
        try{
            json = JSON.parse(json);
        }catch(e){
            console.log('Parse failed');
            console.log(e)
            res.writeHead(400, 'Bad Request');
            res.end();
            return;
        }
    }else{

    }
    
    if(!json){
        res.writeHead(400);
        res.end('Invalid input');
        return;
    }
    processEmail = processEmail.bind(this);
    let ret = processEmail(json);
    if(!ret.status ){
        res.writeHead(400);
        console.log('Invalid input. Error: '+ret.message);
        res.end('Invalid input. Error: '+ret.message);
        return;
    }
    
    res.writeHead(200);
    res.end('success');
});
function processEmail(json){
    //How to handle spam, email 
    // console.log(json);
    // console.log(json.recipient);
    // console.log(json['recipient']);
    let enq = {}
    try{
        enq.fullname = json.subject.split('from ')[1].split(' on')[0];//Enquiry from Anthony Bloomer on Daft.ie | Flat share in Rockfield, Dundrum, Co. Dublin
    }
    catch(e){
        console.log('failed to retrive full name')
    }
    // enq.date = new Date(json.Date);
    try{
        enq.message = json['body-plain'].split('Message:')[1].split('Please be aware of suspicious')[0].trim();
        // enq.message = json['body-plain'].split('Message:')[1].split('</tr>')[0].trim();
    }
    catch(e){
        console.log('failed to retrive message')
        console.log(e)
    }
    // enq.recipient = json.recipient;
    let propKey = '';
    try{
        propKey = json.recipient.split('let-')[1].split('@')[0];
        if(propKey.length!=5) throw "Invalid property Key";
        propKey = propKey.toUpperCase();
    }
    catch(e){
        return {
            status:false,
            message:'failed to retrieve property Key'
        }
    }
    enq.propKey = propKey;
    // console.log(json['body-plain'].replace(/\n/g, " ") );
    // console.log('more deeper');
    // console.log(json['body-plain'].replace(/\n/g, " ").replace(/ {1,}/g," ") );
    // console.log('with split');
    // console.log(json['body-plain'].replace(/\n/g, " ").replace(/ {1,}/g," ").split('Email: ')[1] );
    try{
        enq.email = json['body-plain'].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0]
        // enq.email = json['body-plain'].replace(/\n/g, " ").replace(/ {1,}/g," ").split('Email: ')[1].split(' ')[0];
        if(enq.email.indexOf('supportdesk@daft.ie')!=-1){//it took dafts email. use 2nd logic now.
            console.log('Using 2nd logic to fetch email')
            enq.email = json['body-plain'].split('Email:')[1].split(' ')[1].trim();
            if( !validateEmail(enq.email) ){
                console.log('Using 3rd logic to fetch email')
                enq.email = json['body-plain'].split('Email:')[1].split(' ')[0].trim();
            }
            if( !validateEmail(enq.email) ){
                console.log('Using 4rd logic to fetch email')
                enq.email = enq.email.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0]
            }
            console.log('Email is: '+enq.email)
        }
    }catch(e){}
    if( !validateEmail(enq.email) ) {
        return {
            status:false,
            message:'failed to retrieve email'
        }
    }
    console.log(enq.email);



    try{
        enq.mobile = json['body-plain'].split('Phone number:')[1].split('Property')[0].trim();
        // enq.mobile = json['body-plain'].split('Phone number: ')[1].split(' ')[0];
    }catch(e){}
    // console.log(enq);

    let auction = Collections.Auctions.findOne({lettingAuctionCode: enq.propKey});
    if(!auction ){
        //Auction not found, don't process this 
        return {
            status:false,
            message:'Auction not found'
        }
    }
    let property = false;
    if(auction.propertyId) property = Collections.Properties.findOne({_id:auction.propertyId})
    if(!property ){
        //Auction not found, don't process this 
        return {
            status:false,
            message:'Property not found'
        }
    }
    let user = Meteor.users.findOne({'profile.email': enq.email})
    if(!user){//User not found, so insert a new emailEnquiry, send emailEnquiryReceived
        let existingEnquiry = Collections.EmailEnquiries.findOne({email: enq.email,propertyId: property._id,auctionId: auction._id})

        if(!existingEnquiry){//Not existing, insert new one
            let emailEnquiryId = Collections.EmailEnquiries.insert({
                fullname: enq.fullname,
                email: enq.email,
                mobile: enq.mobile,
                // propKey: enq.propKey,
                propertyId: property._id,
                auctionId: auction._id,
                createdAt: new Date(),
                message: enq.message,
                isArchived: false
            })
            console.log("emailEnquiry placed: "+emailEnquiryId);
            var data = {
                userEmail: enq.email,
                fullname: enq.fullname,
                requestType: 'emailEnquiryReceived',//This is an Ack email for all the emailEnqueries placed by user in a group of 15mns. 
                emailEnquiryId:emailEnquiryId,
                propertyId: property._id,
            }
            Meteor.call('requestEmail',data);

            if(isNaN(auction.enquiryCount)){//if its not a number ; for first time scenarios.
                Collections.Auctions.update(auction._id, {
                    $set: {
                        "enquiryCount": 1
                    }
                });
            }else{
                Collections.Auctions.update(auction._id, {
                    $inc: {
                        "enquiryCount": 1
                    }
                });
            }

            //////////////LANDLORD EMAIL
            let address = titleCase(property.address.address);
            if (property.address.area) address +=', '+titleCase(property.address.area)
            if (property.address.county) address +=', '+titleCase(property.address.county)
            let subject = 'Enquiry received for '+address;

            let agent = Meteor.users.findOne({_id:property.createdByAgent})
            let userFirstName = agent.profile.name;
            if(userFirstName){
                userFirstName = titleCase(userFirstName.split(' ')[0]);
            }
            let ec = auction.enquiryCount;
            if(!ec)ec=1;
            else ec+=1;
            let ac = auction.bids;
            let subHeading = 'This letting has received '+ec+' email '+(ec>1 ? 'enquiries':'enquiry')+' and '+(ac==0 ? 'no':ac)+' '+(ac!=1 ? 'applications':'application')+' so far.'
            let sluggedName = slugifyEmailAddress(agent.profile.name);
            if(!sluggedName)sluggedName = 'rent'
            let propertyEmail = sluggedName+'-let-'+auction.lettingAuctionCode.toLowerCase()+"@spotmycrib.ie";
            let user = {
                "profile":{
                    name:enq.fullname,
                    email:enq.email,
                    userFirstName:userFirstName
                }
            }
            var mailData     = {
                template    : 'emailEnquiryReceivedLandlord',
                subject     : subject,
                mailTo      : agent.profile.email,//mailTo: 'srikanth681@gmail.com',
                replyTo      : enq.email,
                property: property,
                bedsCount   : property.bedrooms.length,
                rentFormated: numDifferentiation(auction.price),
                auction: auction,
                enquiry:enq,
                propertyKeys     : auction.lettingAuctionCode,
                agent        : agent,
                user        : user,
                propertyImage:false,//dont need it here
                propertyUrl:FlowRouter.url('rent', { slug: property.slug, key: auction.lettingAuctionCode }),
                propertyApplicationsUrl:FlowRouter.url('account/propertyApplications', { id: property._id }),
                propertyEmail:propertyEmail,
                subHeading: subHeading
            };
            try{
                Meteor.call('sendNotificationEmail', mailData);//Keep it asynchronous for speed
                // Meteor.call('sendNotificationEmail', mailData,true);//if you don't want it to fail and need it to be sync, use email queues instead.
            }catch(e){
                console.log('Mail sending failed. ')
                console.log(e)
                return {
                    status:false,
                    message:'Mail sending failed'
                }
            }


        }else{//There is an existing enquiry
            return {
                status:false,
                message:'Request already exists'
            }
        }
    }else if(user){// User found, insert bid, send uploadRefsReminder
        this.placeBidCallback = function(error, result){
            if(error){
                console.log("emailEnquiry bid failed");
                console.log(error);
                return false;
            }
            if(result.status=='Success'){
                console.log("emailEnquiry bid success");
            }
        }
        this.placeBidCallback = this.placeBidCallback.bind(this);
        Meteor.call('placeBid',[auction._id, auction.price, enq.message,user._id],this.placeBidCallback);
        if(getUserProfileScore(user)< 70){
            var mailData = {
                userEmail: enq.email,
                fullname: enq.fullname,
                requestType: 'uploadRefsReminder',//This is a reminder email for the user to complete their profile. 
                propertyId: property._id,
                auctionId: auction._id,
            }
            // Meteor.call('requestEmail',mailData);//Temporarly disabling the reminder emails.
        }
    }
    
    return {
        status:true,
        message:'end of method'
    }
}

function getUserProfileScore (user) {
    let score = 0;

    if(user.profile.mobile){score += 15;}
    if(!user.services)user.services={}
    if(user.services.facebook){score += 15;}
    // if(user.services.google){score += 10;}
    if(user.services.twitter){score += 10;}
    if(user.services.linkedin){score += 15;}
    if(user.profile.references.hasPassport){score += 10;}
    if(user.profile.references.employerName){score += 3;}
    if(user.profile.references.employerTakeHome){score += 2;}
    if(user.profile.references.hasWorkRef){score += 10;}
    if(user.profile.references.hasLandlordRef){score += 10;}
    if(user.profile.references.hasPPS){score += 3;}
    // if(user.profile.references.hasFinancialRef){score += 0;}
    if(user.profile.references.hasGovtID){score += 4;}
    if(user.profile.references.hasResume){score += 3;}

    if(score>100)score = 100;
    return score;
}
function numDifferentiation(val) {
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function slugifyEmailAddress (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ/_,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '.')           // Replace spaces with "."
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with ''
        // .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single ''
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
/*
Url {
            I20181205-20:24:53.640(0)?   protocol: null,
            I20181205-20:24:53.640(0)?   slashes: null,
            I20181205-20:24:53.642(0)?   auth: null,
            I20181205-20:24:53.644(0)?   host: null,
            I20181205-20:24:53.645(0)?   port: null,
            I20181205-20:24:53.646(0)?   hostname: null,
            I20181205-20:24:53.646(0)?   hash: null,
            I20181205-20:24:53.647(0)?   search: null,
            I20181205-20:24:53.648(0)?   query: null,
            I20181205-20:24:53.649(0)?   pathname: '/account/profile',
            I20181205-20:24:53.649(0)?   path: '/account/profile',
            I20181205-20:24:53.651(0)?   href: '/account/profile',
            I20181205-20:24:53.651(0)?   _raw: '/account/profile' }


 */