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
var v_youid = null;

$(function(){
	gPref = new Settings();

	// Tabs


        $("#alert-dlg").hide();
        $("#add-dlg").hide();
        $("#verify-dlg").hide();

        v_youid = new YouId_View(false);

        $('a[href="#add_youid"]').click(function(e){v_youid.click_add_youid(e);});


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
    var hdr_list = [];

/**
    list = [{id:"http://id.myopenlink.net/public_home/smalinin/Public/YouID/IDcard_Twitter_160927_202756/160927_202756_profile.ttl#identity",name:"Alice1",mod:"020304",exp:"65537"},
            {id:"http://myyouid2",name:"Alice2",mod:"020304",exp:"65537"}
            ];
**/
    v_youid.load_youid_list();

    try {
      var v = gPref.getValue('ext.youid.pref.hdr_list');
      if (v)
        hdr_list = JSON.parse(v);
    } catch(e){}

    load_hdr_list(hdr_list);
}



function savePref()
{
   v_youid.save_youid_data();
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


