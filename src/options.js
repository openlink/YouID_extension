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


        $("#alert-dlg").hide();
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
  $('.hdr_del').not('.click-binded').click(hdr_del).addClass('click-binded');
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
  $('.youid_del').not('.click-binded').click(youid_del).addClass('click-binded');
  $('#youid_data>tr>td>#chk').not('.click-binded').click(youid_select).addClass('click-binded');
  $('.youid_verify').not('.click-binded').click(verify_youidItem).addClass('click-binded');
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

  if (youid && youid.id) {
     var loader = new YouID_Loader(showInfo);
     loader.verify_ID(youid.id, function(success, youid, msg, verify_data){
        showVerifyDlg(false, youid, msg, verify_data);
      });

  }

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
      width: 620,
      height:170,
      modal: true,
      buttons: {
        "OK": function() {
          var uri = $('#uri').val().trim();
          var loader = new YouID_Loader(showInfo);
          loader.verify_ID(uri, showVerifyDlg);
          $(this).dialog( "close" );
        },
        Cancel: function() {
          $(this).dialog( "close" );
        }
      }
  });
}


function showVerifyDlg(success, youid, msg, verify_data) 
{
  $("#verify-msg").prop("textContent",msg); 
  $('#verify-data #row').remove();
  $('#verify-data').append(verify_data);

  $( "#verify-dlg" ).dialog({
      resizable: false,
      width: 630,
      height:400,
      modal: true,
      buttons: {
        "OK": function() {
          if (success) {
            addYouIdItem(false, youid)
          }
          $(this).dialog( "close" );
        },
        Cancel: function() {
          $(this).dialog( "close" );
        }
      }
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
