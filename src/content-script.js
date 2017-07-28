
window.addEventListener("message", recvMessage, false);

function recvMessage(event)
{
  var ev_data;

  if (String(event.data).lastIndexOf("youid:",0)!==0)
    return;

  try {
    ev_data = JSON.parse(event.data.substr(6));
  } catch(e) {}


  if (ev_data && ev_data.getWebId) {

    var pref_youid;     
    try {
      var v = localStorage.getItem("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}


    Browser.api.runtime.sendMessage(null, 
              { getWebId: true},
              function (response) {
//                 console.log(JSON.stringify(response, undefined, 2));

                 if (response.webid) {
                   var msg = '{"webid":"'+response.webid+'"}';
                   event.source.postMessage("youid_rc:"+msg, event.origin);
                 }

              });
  }
}
