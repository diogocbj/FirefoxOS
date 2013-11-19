YoutubeController = function($scope) {
	
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);
	
	$scope.larguraPlayer = screen.width;
    $scope.alturaPlayer = screen.height;
    $scope.larguraPlayer -= $scope.larguraPlayer * 0.10;
    $scope.alturaPlayer -= $scope.alturaPlayer * 0.50;

    $scope.resultados = [];
    $scope.historico = [];
    $scope.pesquisas = [];
    $scope.campoPesquisa = '';

    $scope.inicioApp = true;
    		
	$scope.setInicioApp = function() {
		$scope.campoPesquisa = '';
		$scope.inicioApp = $scope.setCurrent();
	};

	$scope.setTelaPlayer = function() {
		$scope.telaPlayer = $scope.setCurrent();
	};

	$scope.setTelaResultado = function() {
		$scope.telaResultado = $scope.setCurrent();
	};

	$scope.setTelaHistorico = function() {
		$scope.telaHistorico = $scope.setCurrent();
	};

	$scope.setTelaPesquisa = function() {
		$scope.telaPesquisa = $scope.setCurrent();
	};

	$scope.setTelaConfig = function() {
		$scope.telaConfig = $scope.setCurrent();
	};

	$scope.setCurrent = function() {
		
		$scope.inicioApp =  false;
		$scope.telaPlayer =  false;
		$scope.telaResultado = false;
		$scope.telaHistorico = false;
		$scope.telaPesquisa = false;
		$scope.telaConfig = false;

		return true;
	};

	$scope.carregarVideo = function(nomeVideo, vid){
		document.getElementById("videoContainer").innerHTML="<p>Aguarde...</p>";
		document.getElementById("videoContainer").innerHTML="<div id="+'"videoJanela"'+"></div>";
		$scope.video(nomeVideo, vid);
	}

	$scope.video = function(nomeVideo, vid){
 	    
		$scope.setTelaPlayer();
 	    
 	    var playerid = 'videoJanela';

 	    player = new YT.Player(playerid, {
		        height: $scope.alturaPlayer,
		        width: $scope.larguraPlayer,
		        videoId: vid,
		        playerVars: {
		             'autoplay':'1',
		             'controls':'1',
		             'enablejsapi':'1',
		             'showinfo':'0',
		             'autohide':'1'
		         },
		    });
	   
	    if(nomeVideo != "noAddHist"){
			$scope.addHistorico(nomeVideo,vid);
		} 
		return false;
	};
	
	$scope.pesquisarVideos = function() {
		if($scope.campoPesquisa != ""){
			$scope.limparResultados();
			$scope.setTelaResultado();
			xml = xmlMicoxLoader("http://gdata.youtube.com/feeds/api/videos?q="+$scope.campoPesquisa+"&start&max-results=15&v=2");
			xmlMicoxArvore(xml,"");
			$scope.addPesquisa($scope.campoPesquisa);	
		}else{
			alert ("Informe uma Pesquisa");
		}				
	};

	$scope.pesquisarVideosParametro = function(nomePesquisa) {
		$scope.limparResultados();
		$scope.setTelaResultado();
		var xml = xmlMicoxLoader("http://gdata.youtube.com/feeds/api/videos?q="+nomePesquisa+"&start&max-results=10&v=2");
		xmlMicoxArvore(xml,"");		
	};

	function xmlMicoxLoader(url){
		var Loader = new XMLHttpRequest({mozSystem: true});
		Loader.open("GET", url ,false);
		Loader.send(null);
		return Loader.responseXML;
	};

	function xmlMicoxArvore(xmlNode, identacao){
		
		var nomeNo = "";
		var valorNo = "";
		var nomeVideoTemp = "";
		var idVideoTemp = "";

		var arvoreTxt=""; //esta var armazenara o conteudo
		for(var i=0;i<xmlNode.childNodes.length;i++){//percorrendo os filhos do nó
			if(xmlNode.childNodes[i].nodeType == 1){//ignorar espaços em branco
				//pegando o nome do nó
				arvoreTxt = arvoreTxt + identacao + xmlNode.childNodes[i].nodeName + ": ";

				nomeNo = xmlNode.childNodes[i].nodeName;
				if(xmlNode.childNodes[i].childNodes.length==0){
					//se não tiver filhos eu já pego o nodevalue
					arvoreTxt = arvoreTxt + xmlNode.childNodes[i].nodeValue
					for(var z=0;z<xmlNode.childNodes[i].attributes.length;z++){
						var atrib = xmlNode.childNodes[i].attributes[z];
						arvoreTxt = arvoreTxt + " (" + atrib.nodeName + " = " + atrib.nodeValue + ")";
					}
					arvoreTxt = arvoreTxt + "<br />\n";
				}else if(xmlNode.childNodes[i].childNodes.length>0){
					//se tiver filhos eu tenho que pegar o valor pegando o valor do primeiro filho
					arvoreTxt = arvoreTxt + xmlNode.childNodes[i].firstChild.nodeValue;
					valorNo = xmlNode.childNodes[i].firstChild.nodeValue;						
					for(var z=0;z<xmlNode.childNodes[i].attributes.length;z++){
						var atrib = xmlNode.childNodes[i].attributes[z];
						arvoreTxt = arvoreTxt + " (" + atrib.nodeName + " = " + atrib.nodeValue + ")";
					}
					//recursividade para carregas os filhos dos filhos
					arvoreTxt = arvoreTxt + "<br />\n" + xmlMicoxArvore(xmlNode.childNodes[i],identacao);
					
					if(nomeNo == "media:title"){
						nomeVideoTemp = valorNo;
					}

					if(nomeNo == "yt:videoid"){
						idVideoTemp = valorNo;
					}

					if(nomeVideoTemp != "" && idVideoTemp != ""){
						$scope.resultados.push({
				            nomeVideo: nomeVideoTemp,
				            idVideo: idVideoTemp 
				        });

				        nomeVideoTemp = "";
				        idVideoTemp = "";
					}       
				}				
			}
		}
	};

	$scope.carregarStorage = function() {
        $scope.carregarHistorico();
        $scope.carregarPesquisa();
    };

	$scope.addPesquisa = function(nomePesquisa) {
        $scope.pesquisas.unshift({
            nomePesquisa: nomePesquisa, 
            deletar:false
        });

        if($scope.pesquisas.length > 30){
        	$scope.pesquisas.pop();
        }
        $scope.salvarPesq();
    };

    $scope.salvarPesq = function() {
        localStorage.setItem("pesquisas", JSON.stringify($scope.pesquisas));
    };

    $scope.carregarPesquisa = function() {
		var pesquisasLista = localStorage.getItem("pesquisas");
		$scope.pesquisas = JSON.parse(pesquisasLista);

		if($scope.pesquisas) {
			return true;
		}else{
			$scope.pesquisas = [];
		}
    };

	$scope.addHistorico = function(nomeVideoTemp,idVideoTemp) {
        $scope.historico.unshift({
            nomeVideo: nomeVideoTemp,
            idVideo: idVideoTemp, 
            deletar:false
        });

        if($scope.historico.length > 30){
        	$scope.historico.pop();
        }
        $scope.salvarHist();
    };

    $scope.salvarHist = function() {    	
        localStorage.setItem("historico", JSON.stringify($scope.historico));
    };

    $scope.carregarHistorico = function() {
		var historicoLista = localStorage.getItem("historico");
		$scope.historico = JSON.parse(historicoLista);

		if($scope.historico) {
			return true;
		}else{
			$scope.historico = [];
		}
    };

    $scope.limparPesquisa = function() {
        do{
        	$scope.pesquisas.splice(0,1);
        }while($scope.pesquisas.length > 0);
        $scope.salvarPesq();
        alert ("Pesquisas deletadas!");
    };

    $scope.limparHistorico = function() {
    	do{
        	$scope.historico.splice(0,1);
        }while($scope.historico.length > 0);
        $scope.salvarHist();        
        alert ("Historico deletado!");
    };

    $scope.limparResultados = function() {
    	do{
        	$scope.resultados.splice(0,1);
        }while($scope.resultados.length > 0);
    };
};