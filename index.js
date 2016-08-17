var debug = require( 'debug' )( 'ifttt:http' );
function mkdirp( path, callback ) {
    $( 'fs' ).exists( path, function( exists ) {
        if( !exists )
            mkdirp( $( 'path' ).dirname( path ), function( err ) {
                if( err )
                    callback( err );
                else
                    $( 'fs' ).mkdir( path, callback )
            });
        else
            callback();
    })
}

module.exports = {
    name: "http", "trigger": {}, "actions": [ {
        name: "get", fields: [ { name: "url", displayName: "URL" }], delegate: function( fields ) {
            var result = function( fields, trigger, completed ) {
                try {
                    var url = $( 'url' ).parse( fields.url );
                    debug( fields.url );
                    debug( url );
                    var requestor;
                    if( url.protocol == 'https:' || url.protocol == 'https' )
                        requestor = $( 'https' );
                    else
                        requestor = $( 'http' );
                    debug( 'calling', fields.url );
                    requestor.request( { hostname: url.hostname, path: url.path, port: url.port, headers: { accept: 'application/json' } })
                        .on( 'clienterror', function( ex ) { debug( ex ); })
                        .on( 'error', function( ex ) { debug( ex ); })
                        .on( 'response', function( response ) {
                            if( completed )
                                completed();
                        })
                        .end();
                }
                catch( ex ) {
                    debug( ex );
                }
            };
            result.fields = fields;
            return result;
        }
    },
        {
            name: "post", fields: [ { name: "url", displayName: "URL" }, { name: "body", displayName: "Corps" }], delegate: function( fields ) {
                var result = function( fields, trigger, completed ) {
                    try {
                        var url = $( 'url' ).parse( fields.url );
                        debug( fields.url );
                        debug( url );
                        var req = $( 'http' ).request( { method: 'post', hostname: url.hostname, path: url.path, port: url.port, headers: { accept: 'application/json' } })
                            .on( 'clienterror', function( ex ) { debug( ex ); })
                            .on( 'error', function( ex ) { debug( ex ); })
                            .on( 'response', function( response ) {
                                if( completed )
                                    completed();
                            });
                        req.write( fields.body );
                        req.end();
                    }
                    catch( ex ) {
                        debug( ex );
                    }
                };
                result.fields = fields;
                return result;
            }
        },
        {
            name: "download", fields: [ { name: "url", displayName: "URL" }, { name: "file", displayName: 'Fichier' }, { name: "userName", displayName: 'Nom d\'utilisateur' }, { name: "password", displayName: 'Mot de passe' }], delegate: function( fields ) {
                var result = function( fields, trigger, completed ) {
                    try {
                        var options = {
                            error: function( ex ) { debug( ex ); }, complete: function( response ) {
                                mkdirp( $( 'path' ).dirname( fields.file ), function() {
                                    debug( fields.file );
                                    var output = $( 'fs' ).createWriteStream( fields.file + '.download' );
                                    response.pipe( output );
                                    output.on( 'close', function() {
                                        debug( 'download complete' );
                                        $( 'fs' ).exists( fields.file, function( exists ) {
                                            if( exists )
                                                $( 'fs' ).unlink( fields.file, function( e ) {
                                                    $( 'fs' ).rename( fields.file + '.download', fields.file, function( e ) {
                                                        if( e )
                                                            debug( e );
                                                        debug( 'download renamed' );
                                                        if( completed )
                                                            completed();
                                                    });
                                                })
                                            else
                                                $( 'fs' ).rename( fields.file + '.download', fields.file, function( e ) {
                                                    if( e )
                                                        debug( e );
                                                    debug( 'download renamed' );
                                                    if( completed )
                                                        completed();
                                                });

                                        })
                                    });
                                    output.on( 'error', function( e ) {
                                        debug( e );
                                        if( completed )
                                            completed();
                                    });
                                });
                            }
                        };
                        if( fields.userName )
                            $.extend( options, { auth: fields.userName + ':' + fields.password });
                        debug( fields.url );
                        $.ajax( fields.url, options )
                    }
                    catch( ex ) {
                        debug( ex );
                    }
                };
                result.fields = fields;
                return result;
            }
        }]
}