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
 
YouID_Loader = function (info_dlg) {
  this.info_dlg = info_dlg;
  this.verify_query = '\
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
       OPTIONAL { ?webid oplcert:onBehalfOf ?behalfOf} \
       OPTIONAL { ?webid acl:delegates ?acl_delegates} \
       OPTIONAL { ?webid pim:storage ?pim_store } \
       OPTIONAL { ?webid ldp:inbox ?inbox } \
    }';
};

YouID_Loader.prototype = {

  verify_ID : function(uri, callback) {
// http://id.myopenlink.net/DAV/home/KingsleyUyiIdehen/Public/kingsley.ttl#this
// https://s3.amazonaws.com/webid-sandbox/Profile/Basic-Identity-Claims-And-Profile-Document.ttl#i
//  uri = "http://id.myopenlink.net/public_home/smalinin/Public/YouID/IDcard_Twitter_160927_202756/160927_202756_profile.ttl#identity";
//  uri = "http://dbpedialite.org/titles/Lisp_%28programming_language%29";


//  var baseURI = "https://s3.amazonaws.com/webid-sandbox/Profile/Basic-Identity-Claims-And-Profile-Document.ttl";
    var self = this;
    var baseURI = new Uri(uri).setAnchor("").toString();

    var get_url = uri + ((/\?/).test(uri) ? "&" : "?") + (new Date()).getTime();


    jQuery.ajaxSetup({
       dataType: "text",
       headers:{'Accept': 'text/turtle;q=1.0,application/ld+json;q=0.5,text/plain;q=0.2,text/html;q=0.5,*/*;q=0.1'},
       cache: false,
    });

    jQuery.get(get_url, 
      
      function(data, status){

       rdfstore.Store.yieldFrequency(50);
       rdfstore.create(function(err, store) {

        store.load('text/n3', data, {documentIRI:baseURI}, function(err, results) {
          if (err) {
            self.info_dlg("Could not parse profile\n\n"+err+"\n\n Profile data:\n\n"+data);
            return;
          }
          var query = self.verify_query; //??-- .replace(/%URI%/g, uri);
          try {
             store.execute(query, function(err, results) {
             // process results
               if (err || (results && results.length==0)) {
                 self.info_dlg("Could not extract profile data\n"+(err?err:""));
                 return;
               }

               var youid = { id: null, name: null, pubkey: null,
                     mod: null, exp: null, delegate: null,
                     acl: [], behalfOf: [],
                     pim: null, inbox: null };

               var url, acl_delegates, behalfOf;
               var schema_name, foaf_name, rdfs_name, skos_prefLabel, skos_altLabel;

               acl_delegates = {};
               behalfOf = {};

               for(var i=0; i < results.length; i++) {
                 var r = results[i];
                 if (r.url && String(r.url.value).lastIndexOf(baseURI, 0)!=0)
                   continue;

                 if (r.delegate)
                   youid.delegate = r.delegate.value;
                 if (r.acl_delegates)
                   acl_delegates[r.acl_delegates.value] = 1;
                 if (r.behalfOf)
                   behalfOf[r.behalfOf.value] = 1;
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

               var _tmp = Object.keys(behalfOf);
               for(var i=0; i<_tmp.length; i++)
                 youid.behalfOf.push(_tmp[i]);

               var msg, success, verify_data;
               if (youid.id && youid.pubkey && youid.mod && youid.exp && youid.name) {
                 msg = "Successfully verified.";
                 success = true;
               } else { 
                 msg = "Failed, could not verify WebID.";
                 success = false;
               }

               verify_data = "";
               verify_data += "<tr id='row'><td>WebID</td><td>"+youid.id+"</td></tr>";
               verify_data += "<tr id='row'><td>Name</td><td>"+youid.name+"</td></tr>";
               verify_data += "<tr id='row'><td>PubKey</td><td>"+youid.pubkey+"</td></tr>";
               verify_data += "<tr id='row'><td>Modulus</td><td>"+youid.mod+"</td></tr>";
               verify_data += "<tr id='row'><td>Exponent</td><td>"+youid.exp+"</td></tr>";
               if (youid.delegate)
                 verify_data += "<tr id='row'><td>Delegate</td><td>"+youid.delegate+"</td></tr>";
/***
               if (youid.acl.length>0) {
                 var s = "";
                 for(var i=0; i<youid.acl.length; i++)
                   s += "<div>"+youid.acl[i]+"</div>";
                 $('#verify-data').append("<tr id='row'><td>ACL</td><td>"+s+"</td></tr>");
               }
***/

               if (youid.pim)
                 verify_data += "<tr id='row'><td>Storage</td><td>"+youid.pim+"</td></tr>";
               if (youid.inbox)
                 verify_data += "<tr id='row'><td>Inbox</td><td>"+youid.inbox+"</td></tr>";

               if (youid.behalfOf.length>0) {
                 var s = "";
                 for(var i=0; i<youid.behalfOf.length; i++)
                   s += "<div>"+youid.behalfOf[i]+"</div>";
                 verify_data += "<tr id='row'><td>OnBehalfOf</td><td>"+s+"</td></tr>";
               }

               if (callback)
                 callback(success, youid, msg, verify_data);
             });
          } catch(e) {
             console.log(e);
             self.info_dlg("Error:"+e);
          }
        });

       });

        
      }, "text").fail(function(msg) {
        self.info_dlg("Could not load data from: "+uri+"\nError: "+msg.statusText);
    });
  }
}
