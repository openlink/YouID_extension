/*
 *  This file is part of the OpenLink Structured Data Sniffer
 *
 *  Copyright (C) 2015-2016 OpenLink Software
 *
 *  This project is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by the
 *  Free Software Foundation; only version 2 of the License, dated June 1991.
 *
 *  This program is distributed in the hope that it will be useful, but
 *  WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 *
 */

var gPref = null;

$(function(){
	gPref = new Settings();

	// Tabs


        $("#save-confirm").hide();
        $("#add-dlg").hide();
        $("#verify-dlg").hide();


        $('#youid_add').click(add_YouID);
        $('#youid_add').button({
          icons: { primary: 'ui-icon-plusthick' },
          text: false 
        });

        $('#hdr_add').click(hdr_add);
        $('#hdr_add').button({
          icons: { primary: 'ui-icon-plusthick' },
          text: false 
        });


	$('#tabs').tabs();

        loadPref();

        $('#OK_btn').click(savePref);
        $('#Cancel_btn').click(function() { 
            closeOptions(); 
         });


        $('#ext_ver').text('Version: '+ Browser.api.runtime.getManifest().version);
});


function closeOptions() 
{
    if (Browser.isChromeAPI && Browser.isFirefoxWebExt) {
      Browser.api.tabs.getCurrent(function(tab) {
        Browser.api.tabs.remove(tab.id);
      });
    } else {
      window.close(); 
    }
}

function loadPref() 
{
    var pref_youid = null;
    var list = [];
    var hdr_list = [];


    try {
      var v = gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}
    
    try {
      var v = gPref.getValue('ext.youid.pref.list');
      if (v)
        list = JSON.parse(v);
    } catch(e){}
/**
    list = [{id:"http://id.myopenlink.net/public_home/smalinin/Public/YouID/IDcard_Twitter_160927_202756/160927_202756_profile.ttl#identity",name:"Alice1",mod:"020304",exp:"65537"},
            {id:"http://myyouid2",name:"Alice2",mod:"020304",exp:"65537"}
            ];
**/
    load_youid_list(pref_youid, list);

    try {
      var v = gPref.getValue('ext.youid.pref.hdr_list');
      if (v)
        hdr_list = JSON.parse(v);
    } catch(e){}

    load_hdr_list(hdr_list);
}  



function savePref() 
{
   save_youid_data();
   save_hdr_list();
   closeOptions();
}


// ========== hdr List ===========

function createHdrRow(row)
{
  if (!row)
    return;
  var del = '<button id="hdr_del" class="hdr_del">Del</button>';
  return '<tr><td width="16px">'+del+'</td>'
        +'<td ><input style="WIDTH: 98%" id="h" value="'+row.hdr+'"></td>'
        +'<td ><input style="WIDTH: 98%" id="v" value="'+row.val+'"></td>'
        +'</tr>';

}

function addHdrItem(v)
{
  $('#hdr_data').append(createHdrRow(v));
  $('.hdr_del').button({
    icons: { primary: 'ui-icon-minusthick' },
    text: false 
  });
  $('.hdr_del').click(hdr_del);
}


function emptyHdrLst()
{
  var data = $('#hdr_data>tr').remove();
}

function hdr_add() {
    addHdrItem({hdr:"", val:""});
}

function hdr_del(e) {
  //get the row we clicked on
  var row = $(this).parents('tr:first');
  $(row).remove();

  return true;
}

function load_hdr_list(params)
{
  emptyHdrLst();

  for(var i=0; i<params.length; i++) {
    addHdrItem(params[i]);
  }

  if (params.length == 0)
    hdr_add();
}

function save_hdr_list()
{
  var list = [];
  var rows = $('#hdr_data>tr');
  for(var i=0; i < rows.length; i++) {
    var r = $(rows[i]);

    var h = r.find('#h').val();
    var v = r.find('#v').val();
    if (h.length>0 && v.length>0)
       list.push({hdr:h, val:v});
  }

  gPref.setValue('ext.youid.pref.hdr_list', JSON.stringify(list, undefined, 2));
}




// ========== youid List ===========

function add_NewYouID(youid)
{
  addYouIdItem(false, youid);
}


function createYouIdRow(sel, v)
{
  if (!v)
    return;
  var checked = sel ? ' checked="checked"':' ';
  var cls = sel ? ' class="youid_checked"' : ' ';
  var del = '<button id="youid_del" class="youid_del">Del</button>';
  var data = ' mdata="'+encodeURI(JSON.stringify(v, undefined, 2))+'" ';
  var uri = '<a href="'+v.id+'">'+v.id+'</a>';
  var youid = '<table class="youid-item"><tr class="bold_text"><td>'+v.name+'</td></tr><tr><td>'+uri+'</td></tr></table>'
  return '<tr '+cls+data+'><td width="16px">'+del+'</td>'
            +'<td width="10px"><input id="chk" type="checkbox"'+checked+'/></td>'
            +'<td style="WIDTH: 98%">'+youid+'</td>'
            +'<td style="WIDTH: 30px"> <input class="youid_verify" value="Verify" type="button"> </td>'
            +'</tr>';
}

function addYouIdItem(sel, v)
{
  $('#youid_data').append(createYouIdRow(sel, v));
  $('.youid_del').button({
    icons: { primary: 'ui-icon-minusthick' },
    text: false 
  });
  $('.youid_del').click(youid_del);
  $('#youid_data>tr>td>#chk').click(youid_select);
  $('.youid_verify').click(verify_youidItem);
}

function verify_youidItem(e) 
{
  //get the row we clicked on
  var row = $(this).parents('tr:first');
  var youid = null;
  try {
    var str = row.attr("mdata");
    youid = $.parseJSON(decodeURI(str)); 
  } catch(e) {
    console.log(e);
  }

  if (youid && youid.id)
    verify_ID(youid.id);

  return true;
}

function emptyYouIdLst()
{
  var data = $('#youid_data>tr').remove();
}

function youid_select(e) {
  var checked = $(e.target).is(':checked');
  if (checked) {
    var lst = $('#youid_data>tr>td>#chk');

    for(var i=0; i < lst.length; i++) {
      if (lst[i] !== e.target) {
        lst[i].checked = false;
        var row = $(lst[i]).parents('tr:first');
        $(row).toggleClass("youid_checked", false);
      }
    }

    var row = $(this).parents('tr:first');
    $(row).toggleClass("youid_checked", true);
  } 
  else {
    var row = $(this).parents('tr:first');
    $(row).toggleClass("youid_checked", false);
  }

  return true;
}

function youid_del(e) {
  //get the row we clicked on
  var row = $(this).parents('tr:first');
  $(row).remove();

  return true;
}

function load_youid_list(pref_user, params)
{
  emptyYouIdLst();

  for(var i=0; i<params.length; i++) {
    var sel = (pref_user && pref_user.id === params[i].id);
    addYouIdItem(sel, params[i]);
  }

  if (params.length == 0)
    addYouIdItem(false,"");
}

function save_youid_data()
{
  var pref_youid = "";
  var list = [];
  var rows = $('#youid_data>tr');
  for(var i=0; i < rows.length; i++) {
    var r = $(rows[i]);
    var checked = r.find('#chk').is(':checked');

    var youid = null;
    try {
      var str = r.attr("mdata");
      youid = $.parseJSON(decodeURI(str)); 
    } catch(e) {
      console.log(e);
    }

    if (youid) {
       list.push(youid);
       if (checked)
         pref_youid = youid;
    }
  }

  gPref.setValue('ext.youid.pref.list', JSON.stringify(list, undefined, 2));
  gPref.setValue('ext.youid.pref.id', JSON.stringify(pref_youid, undefined, 2));
}


function add_YouID()
{
  $( "#add-dlg" ).dialog({
      resizable: false,
      width: 600,
      height:160,
      modal: true,
      buttons: {
        "OK": function() {
          var uri = $('#uri').val().trim();
          exec_AddYouID(uri);
          $(this).dialog( "close" );
        },
        Cancel: function() {
          $(this).dialog( "close" );
        }
      }
  });
}

function exec_AddYouID(uri)
{
  verify_ID(uri, add_NewYouID);
}


/****
1. oplcert:hasIdentityDelegate
2. acl:delegates
3. pim:storage
4. ldp:inbox

****/
var verify_query = '\
  PREFIX foaf:<http://xmlns.com/foaf/0.1/> \
  PREFIX schema: <http://schema.org/> \
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
  PREFIX owl:  <http://www.w3.org/2002/07/owl#> \
  PREFIX cert: <http://www.w3.org/ns/auth/cert#> \
  PREFIX oplcert: <http://www.openlinksw.com/schemas/cert#> \
  PREFIX acl: <http://www.w3.org/ns/auth/acl#> \
  PREFIX pim: <http://www.w3.org/ns/pim/space#> \
  PREFIX ldp: <http://www.w3.org/ns/ldp#> \
  SELECT * WHERE \
    { \
       {{?url foaf:primaryTopic ?webid .} UNION \
        {?url schema:mainEntity ?webid .} \
        ?webid cert:key ?pubkey . \
        ?pubkey cert:modulus ?mod .  \
        ?pubkey cert:exponent ?exponent . \
       }\
       {{?webid schema:name ?schema_name} UNION \
        {?webid foaf:name ?foaf_name} UNION \
        {?webid rdfs:label ?rdfs_name} UNION \
        {?webid skos:prefLabel ?skos_prefLabel} UNION \
        {?webid skos:altLabel ?skos_altLabel} \
        UNION \
        {?url schema:name ?schema_name} UNION \
        {?url foaf:name ?foaf_name} UNION \
        {?url rdfs:label ?rdfs_name} UNION \
        {?url skos:prefLabel ?skos_prefLabel} UNION \
        {?url skos:altLabel ?skos_altLabel} \
       } \
       OPTIONAL { ?webid oplcert:hasIdentityDelegate ?delegate} \
       OPTIONAL { ?webid acl:delegates ?acl_delegates} \
       OPTIONAL { ?webid pim:storage ?pim_store } \
       OPTIONAL { ?webid ldp:inbox ?inbox } \
    }';


function verify_ID(uri, on_success)
{
// http://id.myopenlink.net/DAV/home/KingsleyUyiIdehen/Public/kingsley.ttl#this
// https://s3.amazonaws.com/webid-sandbox/Profile/Basic-Identity-Claims-And-Profile-Document.ttl#i
//  uri = "http://id.myopenlink.net/public_home/smalinin/Public/YouID/IDcard_Twitter_160927_202756/160927_202756_profile.ttl#identity";
//  uri = "http://dbpedialite.org/titles/Lisp_%28programming_language%29";


//  var baseURI = "https://s3.amazonaws.com/webid-sandbox/Profile/Basic-Identity-Claims-And-Profile-Document.ttl";
  var baseURI = new Uri(uri).setAnchor("").toString();
  var store = new rdfstore.Store(function(err, store) {
    // the new store is ready
  });

  var get_url = uri + ((/\?/).test(uri) ? "&" : "?") + (new Date()).getTime();


  jQuery.ajaxSetup({
     dataType: "text",
     headers:{'Accept': 'text/turtle;q=1.0,application/ld+json;q=0.5,text/plain;q=0.2,text/html;q=0.5,*/*;q=0.1'},
     cache: false,
  });

  jQuery.get(get_url, 
      
      function(data, status){

      store.load('text/n3', data, {documentIRI:baseURI}, function(err, results) {
         if (err) {
           showInfo("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
           return;
         }
         var query = verify_query.replace(/%URI%/g, uri);
         try {
             store.execute(query, function(err, results) {
             // process results
               if (err || (results && results.length==0)) {
                 showInfo("Could not extract profile data\n"+(err?err:""));
                 return;
               }

               var youid = { id: null, name: null, pubkey: null,
                     mod: null, exp: null, delegate: null,
                     acl: [], pim: null, inbox: null };

               var url, acl_delegates;
               var schema_name, foaf_name, rdfs_name, skos_prefLabel, skos_altLabel;

               acl_delegates = {};

               for(var i=0; i < results.length; i++) {
                 var r = results[i];
                 if (r.url && String(r.url.value).lastIndexOf(baseURI, 0)!=0)
                   continue;

                 if (r.delegate)
                   youid.delegate = r.delegate.value;
                 if (r.acl_delegates)
                   acl_delegates[r.acl_delegates.value] = 1;
                 if (r.pim_store)
                   youid.pim = r.pim_store.value;
                 if (r.inbox)
                   youid.inbox = r.inbox.value;

                 if (r.url)
                   url = r.url.value;
                 if (r.pubkey)
                   youid.pubkey = r.pubkey.value;
                 if (r.mod)
                   youid.mod = r.mod.value;
                 if (r.exponent)
                   youid.exp = r.exponent.value;
                 if (r.webid)
                   youid.id = r.webid.value;

                 if (r.schema_name)
                   schema_name = r.schema_name.value;
                 if (r.foaf_name)
                   foaf_name = r.foaf_name.value;
                 if (r.rdfs_name)
                   rdfs_name = r.rdfs_name.value;
                 if (r.skos_prefLabel)
                   skos_prefLabel = r.skos_prefLabel.value;
                 if (r.skos_altLabel)
                   skos_altLabel = r.skos_altLabel.value;
               }
               if (skos_prefLabel)
                 youid.name = skos_prefLabel;
               else if (skos_altLabel)
                 youid.name = skos_altLabel;
               else if (schema_name)
                 youid.name = schema_name
               else if (foaf_name)
                 youid.name = foaf_name;
               else if (rdfs_name)
                 youid.name = rdfs_name;

               var _tmp = Object.keys(acl_delegates);
               for(var i=0; i<_tmp.length; i++)
                 youid.acl.push(_tmp[i]);

               var msg, success;
               if (youid.id && youid.pubkey && youid.mod && youid.exp && youid.name) {
                 msg = "Successfully verified.";
                 success = true;
               } else { 
                 msg = "Failed, could not verify WebID.";
                 success = false;
               }

               $("#verify-msg").prop("textContent",msg); 
               $('#verify-data #row').remove();
               $('#verify-data').append("<tr id='row'><td>WebID</td><td>"+youid.id+"</td></tr>");
               $('#verify-data').append("<tr id='row'><td>Name</td><td>"+youid.name+"</td></tr>");
               $('#verify-data').append("<tr id='row'><td>PubKey</td><td>"+youid.pubkey+"</td></tr>");
               $('#verify-data').append("<tr id='row'><td>Modulus</td><td>"+youid.mod+"</td></tr>");
               $('#verify-data').append("<tr id='row'><td>Exponent</td><td>"+youid.exp+"</td></tr>");
               if (youid.delegate)
                 $('#verify-data').append("<tr id='row'><td>Delegate</td><td>"+youid.delegate+"</td></tr>");
/***
               if (youid.acl.length>0) {
                 var s = "";
                 for(var i=0; i<youid.acl.length; i++)
                   s += "<div>"+youid.acl[i]+"</div>";
                 $('#verify-data').append("<tr id='row'><td>ACL</td><td>"+s+"</td></tr>");
               }
***/
               if (youid.pim)
                 $('#verify-data').append("<tr id='row'><td>Storage</td><td>"+youid.pim+"</td></tr>");
               if (youid.inbox)
                 $('#verify-data').append("<tr id='row'><td>Inbox</td><td>"+youid.inbox+"</td></tr>");

               $( "#verify-dlg" ).dialog({
                   resizable: false,
                   width: 600,
                   height:400,
                   modal: true,
                   buttons: {
                     "OK": function() {
                       if (success && on_success)
                         on_success(youid);
                       $(this).dialog( "close" );
                     },
                     Cancel: function() {
                       $(this).dialog( "close" );
                     }
                   }
               });
             });
         } catch(e) {
             console.log(e);
             showInfo("Error:"+e);
         }
       });
       
    }, "text").fail(function(msg) {
       showInfo("Could not load data from: "+uri+"\nError: "+msg.statusText);
    });
}




function showInfo(msg)
{
  $("#alert-msg").prop("textContent",msg); 
  $("#alert-dlg" ).dialog({
    resizable: false,
    width: 600,
    height:400,
    modal: true,
    buttons: {
      Cancel: function() {
        $(this).dialog( "close" );
      }
    }
  });
}
