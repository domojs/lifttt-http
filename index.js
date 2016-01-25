
function mkdirp(path, callback)
{
    $('fs').exists(path, function(exists){
        if(!exists)
            mkdirp($('path').dirname(path), function(err){
                if(err)
                    callback(err);
                else
                    $('fs').mkdir(path, callback)
            });
        else
            callback();
    })
}

module.exports={name:"http", "trigger":{}, "actions":[{name:"get", fields:[{ name:"url", displayName:"URL"}], delegate:function(fields){
        var result= function(fields, trigger, completed){
			try
			{
				var url=$('url').parse(fields.url);
				console.log(fields.url);
				console.log(url);
				var requestor;
				if(url.protocol=='https:' || url.protocol=='https')
				    requestor=$('https');
			    else
			        requestor=$('http');
				requestor.request({hostname:url.hostname, path:url.path, port:url.port, headers:{accept:'application/json'}})
                    .on('clienterror', function(ex){ console.log(ex); })
                    .on('error', function(ex){ console.log(ex); })
                    .on('response', function(response){ 
                        if(completed)    
                            completed();  
                    })
                    .end();
			}
			catch (ex)
			{
				console.log(ex);
			}
        };
        result.fields=fields;
        return result;
}},
{name:"post", fields:[{ name:"url", displayName:"URL"},{ name:"body", displayName:"Corps"}], delegate:function(fields){
        var result= function(fields, trigger, completed){
			try
			{
				var url=$('url').parse(fields.url);
				console.log(fields.url);
				console.log(url);
				var req=$('http').request({method:'post', hostname:url.hostname, path:url.path, port:url.port, headers:{accept:'application/json'}})
                    .on('clienterror', function(ex){ console.log(ex); })
                    .on('error', function(ex){ console.log(ex); })
                    .on('response', function(response){ 
                        if(completed)    
                            completed();  
                    });
                req.write(fields.body);
                req.end();
			}
			catch (ex)
			{
				console.log(ex);
			}
        };
        result.fields=fields;
        return result;
}},
{name:"download", fields:[{ name:"url", displayName:"URL"},{name:"file", displayName:'Fichier'},{name:"userName", displayName:'Nom d\'utilisateur'},{name:"password", displayName:'Mot de passe'}], delegate:function(fields){
        var result= function(fields, trigger, completed){
			try
			{
                var options={error:function(ex){ console.log(ex); }};
                if(fields.userName)
                    $.extend(options, {auth:fields.userName+':'+fields.password});
				$.ajax(fields.url, options)
                    .on('response', function(response){
                        mkdirp($('path').dirname(fields.file), function(){
                            var output = $('fs').createWriteStream(fields.file);
                                response.pipe(output);
                            response.on('close', function(){
                                console.log('download complete');
                                if(completed)
                                    completed();
                            });
                        })
                    })
                    .end();
			}
			catch (ex)
			{
				console.log(ex);
			}
        };
        result.fields=fields;
        return result;
}}]}