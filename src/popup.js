var gPref = null;
var $ = jQuery;

 
$(document).ready(function() 
{

  gPref = new Settings();

  $('#ext_ver').text('version: '+ Browser.api.runtime.getManifest().version);

  load_popup();

});


function create_pulldown_item(youid, sel)
{
  var cls = sel ? ' class="pulldown_checked"' : ' ';
  var checked = sel ? ' checked="checked"':' ';
  var mdata = encodeURI(JSON.stringify(youid, undefined, 2));
  var uri = youid.id ? '<a href="'+youid.id+'" class="uri">'+youid.id+'</a>' : '';
  var pubkey_uri = youid.pubkey?'<a href="'+youid.pubkey+'" class="uri">'+youid.pubkey+'</a>' : '';

  var det = "";
  if (youid.exp) 
     det += '<tr class="dtext"><td>Exponent</td><td>'+youid.exp+'</td></tr> ';
  if (youid.mod) 
     det += '<tr class="dtext"><td>Modulus</td><td>'+youid.mod+'</td></tr> ';
  if (youid.delegate) { 
     var href = youid.delegate?'<a href="'+youid.delegate+'" class="uri">'+youid.delegate+'</a>' : '';
     det += '<tr class="dtext"><td>Delegate</td><td>'+href+'</td></tr> ';
  }
  if (youid.pim) { 
     var href = youid.pim?'<a href="'+youid.pim+'" class="uri">'+youid.pim+'</a>' : '';
     det += '<tr class="dtext"><td>Storage</td><td>'+href+'</td></tr> ';
  }
  if (youid.inbox) { 
     var href = youid.inbox?'<a href="'+youid.inbox+'" class="uri">'+youid.inbox+'</a>' : '';
     det += '<tr class="dtext"><td>Inbox</td><td>'+href+'</td></tr> ';
  }
/***
  if (youid.acl && youid.acl.length>0) {
     var val = "" 
     for(var i=0; i< youid.acl.length; i++) {
       var href = youid.acl[i]?'<a href="'+youid.acl[i]+'" class="uri">'+youid.acl[i]+'</a>' : '';
       val += '<div>'+href+'</div>';
     }
     det += '<tr class="dtext"><td>ACL</td><td>'+val+'</td></tr> ';
  }
***/

  var item = '\
     <table '+cls+' id="data" value="'+mdata+'" style="width:520px; table-layout: fixed;"> \
       <tr> \
         <td style="width:20px"><input id="chk" class="youid_chk" type="checkbox"'+checked+'></td> \
         <td class="ltext">'+youid.name+'</td> \
       </tr> \
       <tr> \
         <td></td> \
         <td class="itext">'+uri+'</td> \
       </tr> \
       <tr> \
         <td></td> \
         <td class="dtext"> \
           <input type="image" class="det_btn" src="lib/css/img/plus.png" width="12" height="12" title="Show details"> \
           Details \
         </td> \
       </tr> \
       <tr id="det_data" style="display:none"> \
         <td></td> \
         <td> \
           <table class="dettable" style="width:490px; table-layout: fixed;"> \
             <tr class="dtext"><td style="width:60px">PubKey</td><td >'+pubkey_uri+'</td> \
             </tr> '+det+' \
           </table> \
         </td> \
       </tr> \
     </table>';
   return item;
}


function load_popup()
{
    var pref_youid = null;
    var list = [];

    try {
      var v = gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}

    try {
      var v = gPref.getValue("ext.youid.pref.list");
      if (v)
        list = JSON.parse(v);
    } catch(e){}

    if (pref_youid && pref_youid.id) {
        var s = create_pulldown_item(pref_youid, true);
        $('#pulldown_list').append('<tr><td>'+s+'</td></tr>');
    }

    $.each(list, function (i, item) {
        var sel = pref_youid && pref_youid.id === item.id;
        if (!sel) {
          var s = create_pulldown_item(item, sel);
          $('#pulldown_list').append('<tr><td>'+s+'</td></tr>');
        }
    });

    $('#pulldown_list').append('<tr><td><a href="options.html" target="_blank">Add&nbspWebID </a></td></tr>');

    $('.det_btn').click(click_det);
    $('.youid_chk').click(select_pulldown_item);
    $('.uri').click(click_uri);
}



function click_det(e)
{
  var el = $(e.target);
  var det_data = el.parents('table#data').find('tr#det_data');
  var is_visible = det_data.is(":visible");
  if (is_visible) {
    det_data.hide();
    el.attr("src","lib/css/img/plus.png");
  }
  else {
    det_data.show();
    el.attr("src","lib/css/img/minus.png");
  }
}


function select_pulldown_item(e)
{
  var checked = $(e.target).is(':checked');
  if (checked) {
    var lst = $('.youid_chk');

    for(var i=0; i < lst.length; i++) {
      if (lst[i] !== e.target) {
        lst[i].checked = false;
        var tbl = $(lst[i]).parents('table#data');
        $(tbl).toggleClass("pulldown_checked", false);
      }
    }

    var tbl = $(this).parents('table#data');
    $(tbl).toggleClass("pulldown_checked", true);
    var data = tbl.attr("value");
    var youid = null;
    try {
      if (data)
        youid = JSON.parse(decodeURI(data));
    } catch(e){}

    if (youid) {
      gPref.setValue('ext.youid.pref.id', JSON.stringify(youid, undefined, 2));
      window.close();
    }

  } 
  else {
    var tbl = $(this).parents('table#data');
    $(tbl).toggleClass("pulldown_checked", false);
  }

  return true;
}

function click_uri(e)
{
 var href = $(e.target).attr("href");
 if (href)
   Browser.openTab(href);
}
