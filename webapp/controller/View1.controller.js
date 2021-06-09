sap.ui.define([
    "sap/m/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/upload/Uploader",
    "sap/m/StandardListItem"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (MobileLibrary, Controller, Item, JSONModel, Uploader, ListItem) {
        "use strict";
        var file;
        return Controller.extend("fileupload.controller.View1", {

            onInit: function () {
                //     var e = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
                //    baseurl = jQuery.sap.getModulePath(e)    
                //    const nodeUrl = baseurl + "/v2/catalog/Sales"    
                //     $.ajax({
                //             type: "GET",
                //             url: nodeUrl,
                //             success: function (data){
                //                   console.log(data);
                //             },
                //             error: function (error){
                //                    console.log("error");
                //             }
                //         });



            },
            getBaseUrl: function () {
                var baseurl;
                var e = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
                baseurl = jQuery.sap.getModulePath(e)
                return baseurl;


            },
            handleUploadPress: function () {

                var that = this;

                const nodeUrl = this.getBaseUrl() + "/nodeservice/node/listRepo?name=kaustrepo"
                //  const testnodeurl = this.getBaseUrl() + "/nodeservice/node/test"
                const oFileUploader = this.byId("fileUploader");
                var domRef = oFileUploader.getFocusDomRef();
                file = domRef.files[0];
                var fileName = file.name;
                fileName = fileName.replace(/\..+$/, '');
                $.ajax({
                    type: "GET",
                    url: nodeUrl


                }).done(function (data) {
                  //  console.log(data);
                    const repId = data.id;
                    const rootId = data.cmisRepositoryId
                    var data = {
                        repId: repId,
                        rootId: rootId,
                        fname: fileName

                    }
                    that.fetchCsrfToken(data, that.getBaseUrl());
                    //     that.getJwtToken(data,that.getBaseUrl());
                })
                    .fail(function (error) {
                        console.log("error accessing the token service", error);
                    })


            },

            fetchCsrfToken: function (data, baseUrl) {
                var that = this;
                //   const baseUrl = this.getBaseUrl();
                const createFolderUrl = baseUrl + "/nodeservice/node/getToken"
                jQuery.ajax({
                    url: createFolderUrl,
                    type: 'HEAD',
                    headers: { 'x-csrf-token': 'fetch' }
                })
                    .done(function (message, text, jqXHR) {
                        //  callback(jqXHR.getResponseHeader('x-csrf-token'), data,baseUrl)
                        that.getJwtToken(jqXHR.getResponseHeader('x-csrf-token'), data, baseUrl);

                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        alert('Error fetching CSRF token: ' + jqXHR.status + ' ' + errorThrown);
                    });

            },

            createFolder: function (jwtToken, data, baseUrl, xcrf) {
         
                var that = this;
                const createFolderUrl = baseUrl + "/nodeservice/node/createfolder"
                jQuery.ajax({
                    url: createFolderUrl,
                    type: 'POST',
                     data: data,
                    headers: {
                        'Authorization': "Bearer " + jwtToken,
                        'X-CSRF-Token': xcrf
                    }

                   
                })
                    .done(function (folderID, text, jqXHR) {
                        alert('Folder ID Created:  ' + folderID);
                        data.rootId = folderID;
                        var form = new FormData();
                        form.append("datafile", file);
                        form.append("cmisaction", "createDocument");
                        form.append("propertyId[0]", "cmis:objectTypeId");
                        form.append("propertyValue[0]", "cmis:document");
                        form.append("propertyId[1]", "cmis:name");
                        form.append("propertyValue[1]", file.name);
                        form.append("succinct", 'true');
                        form.append("rootId",data.rootId);
                        form.append("repId",data.repId);
                        data.form = form;
                        that.createFile(jwtToken, form, baseUrl, xcrf);
                        
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        alert('Error Creating Folder: ' + jqXHR.status + ' ' + errorThrown);
                    });


            },
            createFile: function (jwtToken, data, baseUrl, xcrf) {
                const fileUploadUrl = baseUrl + "/nodeservice/node/fileUpload"
                jQuery.ajax({
                    url: fileUploadUrl,
                    type: 'POST',
                    data: data,
                    enctype:"multipart/form-data",
                    processData: false,
                    contentType:false,
                    headers: {
                        'Authorization': "Bearer " + jwtToken,
                        'X-CSRF-Token': xcrf
                    }

                    
                })
                    .done(function (fileID, text, jqXHR) {
                        alert('File ID Created:  ' + fileID);
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        alert('Error uploading file: ' + jqXHR.status + ' ' + errorThrown);
                    });


            },

            getJwtToken: function (xcrf, data, baseUrl) {
                var that = this;
                const getTokenUrl = baseUrl + "/nodeservice/node/getDocToken"
                jQuery.ajax({
                    url: getTokenUrl,
                    type: 'GET',
                })
                    .done(function (message, text, jqXHR) {
                        alert('Token Created successfully' + message);
                        that.createFolder(message, data, baseUrl, xcrf);



                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        alert('Error Creating Folder: ' + jqXHR.status + ' ' + errorThrown);
                    });


            },



        });
    });


