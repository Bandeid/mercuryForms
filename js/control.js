$(document).ready(function(){
  //função para verificar se a aplicacao esta rodando no browser ou no nwjs
  function is_nwjs(){
    try{
      require('node-webkit-fdialogs');
    } catch (e){return false;}
    return true;
  }

  var host = "localhost";
  // var host = "10.16.100.159";
  var port = "8084";

  if($("#preloaderModal").length > 0) $("#preloaderModal").openModal({dismissible:false});
  if($("#preloaderModal2").length > 0) getTemplates();

  function getTemplates(){
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "http://"+host+":"+port+"/MERCURYFORMS/rest/gettemplates/",
      success: function(data){
        var new_data = data;
        var text_inner = '<div class="row"><h5>Escolha um modelo de formulário: </h5></div>';

        $.each(new_data, function(i, v) {
            text_inner+='<div class=""><div class="col s6 m6"><div class="card grey darken-1"><div class="card-content white-text">'+
            '<span class="card-title">Modelo '+(++i)+'</span><p>'+v+'</p></div><div class="card-action"><a class="btn-flat fill" id="'+v+'">Preencher '+
            '<i class="material-icons">edit</i></a></div></div></div></div>';
        });
        $("#getTemplates").html(text_inner);
        $("#preloaderModal2").openModal({dismissible:false});
      },
      error: function(data){
        console.log("error");
        $("#getTemplates").html("<center>:(<br>Erro ao baixar os templates.<br>Verifique sua conexão com o servidor!</center>");
        $("#preloaderModal2").openModal({dismissible:false});
      }
    });
  }

  $(".modal-trigger").leanModal({dismissible:false});

  $( "#getTemplates" ).on( "click", ".fill", function() {
    var docPath = $(this).attr("id");
    // var file = new File();
    var parts = [
  new Blob([' '], {type: 'text/plain'}),
  ' Same way as you do with blob',
  new Uint16Array([33])
];

// Construct a file
var file = new File(parts, 'sample.txt', {
    lastModified: new Date(0), // optional - default = now
    type: "overide/mimetype" // optional - default = ''
});

var fr = new FileReader();
    // console.log(docPath);
    docPath = "/home/afonso/RESTfulExample/src/main/resources/forms.vazios/"+docPath;
    $.ajax({
      url: "http://"+host+":"+port+"/MERCURYFORMS/rest/download",
      type: "post",
      data: "{'path' : '"+docPath+"'}",
      processData: false,
      contentType: false,
      success: function(data){
        // file  = new File(data, "filename");
        // var reader = new FileReader();
        // reader.onload = function() {
          openFormToEdit(data);
          $("#preloaderModal2").closeModal();
          // $("#preloaderModal2").closeModal();
          // $(".lean-overlay").remove();
        // }
        // reader.readAsText(file, 'ISO-8859-1');
        // openFormToEdit(result);
        // $("#preloaderModal2").closeModal();
        console.log(data);
      },
      error:function(){
        alert("error!");
      }
    });
  });

  function openFormToEdit(file){
    $( ".form-page").html("");
    $(file).find('page').each(function(){
      $(this).find("label").each(function(){
        var $elementTemp = renderElements($(this),"label","r");
        if($elementTemp!=true) $( ".form-page ").append($elementTemp);
      });
      $(this).find("field").each(function(){
        $( ".form-page ").append(renderElements($(this),"field","r"));
      });
      $(this).find("radio").each(function(){
        $( ".form-page ").append(renderElements($(this),"radio","r"));
      });
      $(this).find("popup").each(function(){
        $( ".form-page ").append(renderElements($(this),"popup","r"));
      });
      $(this).find("button").each(function(){
        $( ".form-page ").append(renderElements($(this),"button","r"));
      });
      $(this).find("check").each(function(){
        $( ".form-page ").append(renderElements($(this),"check","r"));
      });
      formName = $(this).attr("title");
      setTitleForm();
    });
  }

  $("a#homeBt").on("click", function(e) {
    var link = this;
    e.preventDefault();
    if(confirm("Esta operação (Voltar ao Menu) irá apagar todos\nos dados. Todavia se os mesmos já foram salvos\ndesconsidere esta mensagem e prossiga (OK).")) window.location = link.href;
  });

  $ ("#editOption").hide(); //esconde logo esse elemento
  $("#groupTableRow").hide();
  $("#optionsTableRow").hide();
  $("#divOpen").hide();

  var formName = "";
  /*tecla ENTER = CLICAR BUTAO*/
  $(document).keypress(function(e) {
    if(e.which == 13) {
      if($("#preloaderModal").length > 0 && (!$("#openFile").is(":focus"))) startNewForm();
      else sendQuery(); //enter code
    }else if(e.keyCode == 46 || e.keyCode==127){ //delete code
      if((selected.length) && (!$("#valorTableField").is(":focus")) && (!$("#descTableField").is(":focus")) && (!$("#fontSizeTableField").is(":focus"))) deleteElement();
      // else alert("NAO pode apagar!");
    }
    // console.log(e.keyCode);
  });


  function sendQuery(){
    var param = $("#query").val();
    $("#result").html("");
    if($.trim(param).length>0){
      $("#result").html('<center><div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue-only">'+
      '<div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div>'+
      '</div><div class="circle-clipper right"><div class="circle"></div></div></div></div></center>');
      $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://"+host+":"+port+"/MERCURYFORMS/rest/search/"+param,
        success: function(data){
          var new_data = data;
          var text_inner ='<p>&nbsp&nbsp&nbsp&nbsp<i>'+new_data[0]['info']+'</i></p>';
          text_inner += '<table id="table"><tbody>';
          var docsRetornados = "";
          $.each(new_data, function(i, v) {
            if(i!=0){
              text_inner+='<tr><td>'+
              '<h5 class="formLink" id="'+v['path']+'">'+v['name']+'</h5><p>Score: '+v['score']+'</p></div></div></td></tr>'
              var text_temp = v['name'];
              if(i==1) docsRetornados += "d"+text_temp.substr(0, 2);
              else docsRetornados += ", d"+text_temp.substr(0, 2);
            }
          });
          docsRetornados = docsRetornados.replace(/-/g,'');
          console.log(docsRetornados);
          text_inner+='</tbody><table>';
          $("#result").html(text_inner);
          if($("#result > #table > tbody" ).children().length > 1){
            text_inner='<div class="center">'+
              '<ul class="pagination">'+
              '</ul></div>';
            $("#result").append(text_inner);
            okPagination=1;
            pagination(1);
          }
        },
        error: function(data){
          $("#result").html("");
          var $toastContent = $('<span>Erro na conexão <i class="tiny material-icons">error_outline</i></span>');
          Materialize.toast($toastContent, 3000);
        }
      });
    }
  }
  $('#newFormBt').click(function(){
    // if($ (".page").children().length == 0) alert("Formulário em branco!");
    // else{
    if(confirm("Esta operação irá apagar o formulário atual\ne criar um novo. Deseja continuar?")){
      $ (".page").html("");
      formName = "";
      updatePropriedades();
      $("#preloaderModal").openModal();
    }
    // }
  });
  $('#bt').click(sendQuery);

  function openFileModal(docPath){
    var formModalHtml = "";
    $("#formModal").html('');
    $(docPath).find('page').each(function(){
      $(this).find("*").each(function(){
        var tagName = $(this).prop("tagName");
        // console.log(tagName);
        if(tagName=="FIELD"){
          var id = $(this).attr("sid");
          var value = $(this).find("value").text();
          var label = $(this).find("label").text();
          if(typeof id == 'undefined') return true;
          $newElementScript = $(
          '<div class="input-field col s6">'+
            '<input value="'+value+'" id="'+id+'" type="text" class="validate">'+
            '<label class="active" for="'+id+'">'+label+'</label></div>');
          $("#formModal").append($newElementScript);
        }else if(tagName=="LABEL"){
          var id = $(this).attr("sid");
          var value = $(this).find("value").text();
          if(typeof id == 'undefined') return true;
          $newElementScript = $(
          '<div class="input-field col s6">'+
            '<p id="'+id+'">'+value+'</p></div>');
            $("#formModal").append($newElementScript);
        }else if(tagName=="RADIO"){
          var id = $(this).attr("sid");
          var value = $(this).find("value").text();
          var label = $(this).find("label").text();
          var group = $(this).find("group").text();
          if(typeof id == 'undefined') return true;
          $newElementScript = $(
          '<div class="input-field col s6">'+
            '<input name="'+group+'" value="'+value+'" id="'+id+'" type="radio">'+
            '<label class="active" for="'+id+'">'+label+'</label></div>');
            $("#formModal").append($newElementScript);
        }else if(tagName=="CHECK"){
          var id = $(this).attr("sid");
          var value = $(this).find("value").text();
          var label = $(this).find("label").text();
          // var group = $(this).find("group").text();
          if(typeof id == 'undefined') return true;
          $newElementScript = $(
          '<div class="input-field col s6">'+
            '<input class="filled-in" checked="'+value+'" id="'+id+'" type="checkbox">'+
            '<label for="'+id+'">'+label+'</label></div>');
            $("#formModal").append($newElementScript);
        }else if(tagName=="popup"){
          var id = $(this).attr("sid");
          var value = $(this).find("value").text();
          var label = $(this).find("label").text();
          var group = $(this).find("group").text();
          if(typeof id == 'undefined') return true;
          $newElementScript = $(
          '<div class="input-field col s6">'+
          '<select name="'+group+'" class="browser-default">'+
            '<option value="0">Caixa de selecão</option></select></div>');
            $("#formModal").append($newElementScript);
          // alert("popup");
        }else if(tagName=="BUTTON"){
          var id = $(this).attr("sid");
          var value = $(this).find("value").text();
          // var label = $(this).find("label").text();
          if(typeof id == 'undefined') return true;
          $newElementScript = $(
          '<div class="input-field col s6">'+
            '<a id="'+id+'" class="child waves-effect grey darken-1 white-text waves-light btn">'+value+'</a></div>');
            $("#formModal").append($newElementScript);
        }
      });
      $('#modal1').openModal();
    });
  }

  $( "#result" ).on( "click", ".formLink", function() {
    var docPath = $(this).attr("id");
    $.ajax({
      url: "http://"+host+":"+port+"/MERCURYFORMS/rest/download",
      type: "post",
      data: "{'path' : '"+docPath+"'}",
      processData: false,
      contentType: false,
      success: function(result){
        // openFileModal(result);
        openFormToEdit(result);
        $('#modal1').openModal();
      },
      error:function(){
        alert("error!");
      }
    });
  });

$("#helpBt").click(function(){
  if($("#modalInfo").length==0) createInfoModal();
  $("#modalInfo").openModal();
});
$("#graficoBt").click(function(){
  // var temp = $("$result").children();
  // if($.trim($("#query").val()).length==0 && ($("#result > #table > tbody" ).children().length <= 1)) alert("É necessário que uma pesquisa seja feita e tenha resultados!");
  // else alert("ok");
  if($("#graficaValoresDialog").length == 0) {
    var $graficaValoresDialog = $('<div id="graficaValoresDialog" class="modal"><div class="modal-content"><div class="row"><h5>Recebendo Parâmetros</h5></div>'+
    '<div class="row"><div class="input-field col s4"><input id="tituloInput" type="text" name="query" value="" placeholder="Título do Gráfico"></div>'+
    '<div class="input-field col s4"><input id="precisaoInput" type="text" name="query" value="" placeholder="Valores para precisão"></div>'+
    '<div class="input-field col s4"><input id="precisaoInput2" type="text" name="query" value="" placeholder="Valores para precisão2"></div><button class="waves-effect right waves-light btn grey darken-2 openGrafico">prosseguir</button></di>'+
    '</div></div>');
    $("html").append($graficaValoresDialog);
  }
  $("#graficaValoresDialog").openModal();
});

$("html").on("click", ".openGrafico", function(){
  if($.trim($("#precisaoInput2").val()).length != 0 && $.trim($("#precisaoInput").val()).length != 0 ){
    $("#graficaValoresDialog").closeModal();

    var $titleGrafico = $("#tituloInput").val();
    var $dataValues = JSON.parse($("#precisaoInput").val());
    var $dataValues2 = JSON.parse($("#precisaoInput2").val());
    $('#grafico').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: ""
        },
        xAxis: {
            categories: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']
        },
        yAxis: {
            title: {
                text: 'Precisão'
            },min: 0, max: 100,
            tickInterval: 5,
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Revocação (Técnica Proposta)',
            data: $dataValues
        },
            {
              name: 'Revocação (Não Estruturado)',
              data: $dataValues2
            }]
    });
    $("#graficoModal").openModal();
    $("#tituloInput").val('');
    $("#precisaoInput").val('');
    $("#precisaoInput2").val('');
  }else alert("Campos em braco!!!");
});
function createInfoModal(){
  var $modalInfo = $('<div id="modalInfo" class="modal"><div class="modal-content"><h4>Informações Gerais</h4>'+
  '<p style="text-align: justify"><i>Mercury Forms</i> é um sistema voltado para a indexação, busca, visualização, criação e preenchimento de '+
  'formulários digitais que foi desenvolvido como Trabalho de Conclusão de Curso. Sobre a indexação foi desenvolvido'+
  ' uma heurística na qual os campos não preenchíveis (ou não valorados) são considerados 50% mais relevantes do que os'+
  ' campos preenchíveis (ou valorados). Como bibliotecas externas utilizadas estão: Lucene, Jersey, NWJS, Jquery, Jquery-UI,'+
  ' Materialize CSS; como linguagem de programação: Java SDK 8.0; como linguagens de marcação: '+
  'HTML5, CSS3, XML e XFDL.</p><br><p style="text-align: justify">Autor do Trabalho e Desenvolvedor: Afonso Henrique Anastácio Calábria, Bacharel em Sistemas de Informação pelo IFCE - Campus'+
  ' Crato-CE.</p></div><div class="modal-footer"><a href="#!" class=" '+
  'modal-action modal-close waves-effect waves-green btn-flat">Fechar</a></div></div>');
  $("html").append($modalInfo);
}

  $( "#enviarBt" ).click(function() {
    var method_action = $(this).attr('methodaction');
    var page = $(this).attr('pageform');
    if($("."+page).children().length) {
      $("#enviarBt > i").html('<div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue-only">'+
      '<div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div>'+
      '</div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');
      var xml = buildXMLForm(page);
      console.log(xml);
      $.ajax({
        url: "http://"+host+":"+port+"/MERCURYFORMS/rest/"+method_action,
        type : 'post',
        dataType: "text",
        data: formName+".xfdl,"+xml,
        processData: false,
        contentType: false,
        success : function(result) {
          console.log(result);
          $("#enviarBt").html('<i class="material-icons">send</i>');
          alert("Formulário enviado e salvo com sucesso!");
          window.location = "./index.html";
        },
        error : function() {
          // alert("erro!");
          $("#enviarBt").html('<i class="material-icons">send</i>');
          alert("Algo deu errado. Verificar conexão com servidor!");
        }
      });
    }
    else alert("Formulário vazio!");
  });
  var isDown = false;   // Tracks status of mouse button

  $(document).mousedown(function() {
    isDown = true;      // When mouse goes down, set isDown to true
  })
  .mouseup(function() {
    isDown = false;    // When mouse goes up, set isDown to false
  });

  $(".sideMenu").mouseover(function(){
    if(isDown){
      $(".ui-draggable-dragging").css("display","none","important");
    }
  });
  $(".page").mouseover(function(){
    if(isDown) {
      $(".ui-draggable-dragging").css("display","block","important");
    }
  });

  var newId = 0; //var para gerar os id's

  $( "#draggable, #label, #field, #button, #radio, #popup, #check" ).draggable({
    helper: "clone",
    cursor: 'move',
    opacity: 0.9
  });

  $( "#droppable, #label, #field, #button, #radio, #popup, #check" ).droppable({
    drop: function (event, ui) {
      var $canvas = $(this);
      if (!ui.draggable.hasClass('canvas-element')) {
        var $canvasElement = ui.draggable.clone();
        var elementID = $canvasElement.attr("id")+"-"+(newId++);
        $canvasElement.removeClass("draggable");
        $canvasElement.addClass('canvas-element');
        $canvasElement.addClass("element");
        $canvasElement.addClass("tooltipped");
        $canvasElement.removeClass("parent");
        $canvasElement.find("*").removeClass("child");
        $canvasElement.attr("id",elementID);
        $canvasElement.draggable({
          containment: '#droppable',
          cursor: 'move',
          opacity: 0.6
        });
        $canvasElement.resizable({
          grid: 10,
          helper: "ui-resizable-helper"
        });
        $canvasElement.css({
          left: ((ui.position.left)),
          top: ((ui.position.top)),
          position: 'absolute'
        });
        $canvasElement.css("font-family","Times New Roman");
        $canvasElement.css("font-weight","normal");
        $canvasElement.css("font-size","12px");
        $canvasElement.css("text-align","left");
        $canvasElement.css("padding", "1%");
        if($canvasElement.find("p").length>0) $canvasElement.css('background-color','inherit');
        if($canvasElement.find("input").length>0){
          $canvasElement.find("label").attr("for",elementID);
          $canvasElement.find("input").attr("id",elementID);
        }
        $canvas.append($canvasElement);
      }
    }
  });
  var selected = ""; //variavel que guarda o valor do elemento selecionado
  //deletar elemento
  function deleteElement(){
    if(($.trim(selected).length>0) && (confirm("Desejas realmente apagar este componente?"))) {
      $( "#"+selected ).fadeOut( 100 );
      $( "#"+selected ).remove();
      selected = "";
      $ ( "#editOption").hide();
    }
    updatePropriedades();
  }

  //clicou fora do elemento
  $( ".page, .sideMenu" ).click(function(event){
    if(selected.length>0 && (!$(event.target).is( "#"+selected )) ) {
      if($( "#"+selected ).find("input").length > 0) {
        $('#'+selected+" > input").prop('disabled',true);
        $('#'+selected+" > input").removeClass("editable");
      }else{
        $('#'+selected).removeClass("editable");
        $( "#"+selected ).css("border", "solid 1px #e0e0e0");
        $('#'+selected).prop('contenteditable',false);
      }
      $('#'+selected).addClass("selected");
      $('#'+selected).data('state', 2);
      updatePropriedades();
      // $ ( "#propriedades" ).hide();
    }
  });

  function setAlignButton(val){
    $("#leftAlignBt, #rightAlignBt, #centerAlignBt, #justifyAlignBt").removeClass("darken-3");
    $("#"+val+"AlignBt").addClass("darken-3");
  }

  $("#leftAlignBt").click(function(){
    if(selected.length){
      $("#"+selected).css("textAlign","left");
      setAlignButton("left");
    }
  });

  $("#rightAlignBt").click(function(){
    if(selected.length){
      $("#"+selected).css("textAlign","right");
      setAlignButton("right");
    }
  });

  $("#centerAlignBt").click(function(){
    if(selected.length){
      $("#"+selected).css("textAlign","center");
      setAlignButton("center");
    }
  });

  $("#justifyAlignBt").click(function(){
    if(selected.length){
      $("#"+selected).css("textAlign","justify");
      setAlignButton("justify");
    }
  });

  function updatePropriedades(){
    $("#groupTableRow").hide();
    $("#optionsTableRow").hide();
    $("#valueTableRow").show();
    $("#alignTableRow").show();
    if(selected.length){
      var temp = "";

      if($( "#"+selected ).find("input[type=text]").length > 0) {
        temp = $( "#"+selected + " > input" ).val();
      }else if($( "#"+selected ).find("p").length > 0) {
        temp = $( "#"+selected ).text();
        // $( "#fs" ).val( $( "#"+selected+"> p" ).css("font-family") );
        // alert($( "#"+selected+"> p" ).css("font-family"));
      }else if($( "#"+selected ).find("input[type=radio]").length > 0) {
        $("#alignTableRow").hide();
        temp = $( "#"+selected + " > label").text();
        $("#groupTableRow").show();
        $("#groupTableField").val($( "#"+selected + " > input").attr("name"));
      }else if($( "#"+selected ).find("input[type=checkbox]").length > 0) {
        $("#alignTableRow").hide();
        temp = $( "#"+selected + " > label").text();
        $("#groupTableField").val($( "#"+selected + " > input").attr("name"));
      }else if($( "#"+selected ).find("select").length > 0) {
        $("#valueTableRow").hide();
        $("#alignTableRow").hide();
        $("#optionsTableRow").show();
        $("#groupTableRow").show();
        $("#groupTableField").val($( "#"+selected +"> select").attr("name"));
      }else if($( "#"+selected ).find("a").length > 0) {
        temp = $( "#"+selected + " > a").text();
        $("#alignTableRow").hide();
      }else{

      }
      $( "#valorTableField" ).val( $.trim(temp) );
      $( "#fontSizeTableField" ).val( getFontSize );
      var font = $( "#"+selected ).css("font-family");
      font = font.replace(/'/g,'');
      // var font = $( "#"+selected ).css("font-family").replace("\\'","");
      // alert(font);
      $( "#fs" ).val( font );
      $( "#descTableField" ).val($( "#"+selected ).attr("data-tooltip"));
      setAlignButton($("#"+selected).css("textAlign"));
    }else{
      $( "#valorTableField" ).val("");
      $( "#fontSizeTableField" ).val("");
      $( "#fs" ).val($("#fs option:first").val());
      $( "#descTableField" ).val('');
      $("#leftAlignBt, #rightAlignBt, #centerAlignBt, #justifyAlignBt").removeClass("darken-3");
    }
  }

  $( "#valorTableField" ).keyup(function() {
    var temp = $( "#valorTableField" ).val();
    if($( "#"+selected ).find("input[type='text']").length > 0) {
      $( "#"+selected + " > input").val(temp);
    }else if($( "#"+selected ).find("p").length > 0) {
      $( "#"+selected+" > p").text(temp);
    }else if($( "#"+selected ).find("input[type='radio']").length > 0) {
      $( "#"+selected + " > label").html(temp);
    }else if($( "#"+selected ).find("input[type='checkbox']").length > 0) {
      $( "#"+selected + " > label").html(temp);
    }else if($( "#"+selected ).find("a").length > 0) {
      $( "#"+selected + " > a").html(temp);
    }
  });

  $( "#groupTableField" ).keyup(function() {
    var temp = $( "#groupTableField" ).val();
    temp = temp.replace(' ','_');
    temp = temp.toUpperCase();
    if($( "#"+selected ).find("select").length > 0)
    $( "#"+selected + "> select").attr("name",temp);
    else
    $( "#"+selected + "> input").attr("name",temp);
  });

  $( "#descTableField" ).keyup(function() {
    var temp = $( "#descTableField" ).val();
    $( "#"+selected ).attr("data-position","bottom");
    $( "#"+selected ).attr("data-tooltip", temp);
    $( "#"+selected ).tooltip({delay: 50});
  });

  //selecionou um elemento
  $( "#droppable" ).on( "click", ".element", function () {
    var state = $(this).data('state');
    switch(state) {
      case 1 :
      case undefined :
      if(selected.length>0) {
        $( "#"+selected ).removeClass("selected");
        $( "#"+selected ).data('state', 1);
      }
      $( this ).addClass("selected");
      selected = $( this ).attr("id");
      $ ( "#editOption").show();
      $(this).data('state', 2); break;
      case 2 :
      $( this ).removeClass("selected");
      selected = "";
      $(this).data('state', 1);
      $ ( "#editOption").hide();
      break;
    }
    updatePropriedades();
  });

  //apagar
  $( "#btDeleteElement").click(deleteElement);

  //editar conteúdo do elemento
  $( "#btEditContent").click(function(){
    if($( "#"+selected ).find("input").length > 0) {
      var $div=$('#'+selected+" > input"), isEditable=$div.is('.editable');
      $('#'+selected+" > input").prop('disabled',isEditable).toggleClass('editable');
      if(!isEditable) $('#'+selected+" > input").focus();
    }else if($( "#"+selected ).find("p").length > 0) {
      var $div=$('#'+selected+"> p" ), isEditable=$div.is('.editable');
      $('#'+selected+"> p" ).prop('contenteditable',!isEditable).toggleClass('editable');
      $('#'+selected+"> p" ).focus();
    }
  });

  function getFontSize(){
    var sizeTemp = "";
    if($( "#"+selected ).find("input[type=text]").length > 0)
    sizeTemp = $('#'+selected+" > input").css("font-size");
    else if ($( "#"+selected ).find("input[type=radio]").length > 0)
    sizeTemp = $('#'+selected+" > input").css("font-size");
    else if ($( "#"+selected ).find("input[type=checkbox]").length > 0)
    sizeTemp = $('#'+selected+" > input").css("font-size");
    else if ($( "#"+selected ).find("p").length > 0)
    sizeTemp = $('#'+selected+"> p").css("font-size");
    else if($( "#"+selected ).find("select").length > 0)
    sizeTemp = $('#'+selected+"> select").css("font-size");
    else if($( "#"+selected ).find("a").length > 0)
    sizeTemp = $('#'+selected+"> a").css("font-size");
    return sizeTemp.replace("px","");
  }

  function setFontSize(newSize){
    if(newSize>=2 && newSize<=100){
      if($( "#"+selected ).find("input[type=text]").length > 0)
      $('#'+selected+" > input").css("font-size",(newSize)+"px" );
      else if ($( "#"+selected ).find("p").length > 0)
      $('#'+selected+"> p").css("font-size",(newSize)+"px" );
      else if($( "#"+selected ).find("input[type=radio]").length > 0){
        $('#'+selected+"> label").css("font-size",(newSize)+"px",'important' );
        $('#'+selected+"> input").css("font-size",(newSize)+"px",'important' );
      }else if($( "#"+selected ).find("input[type=checkbox]").length > 0){
        $('#'+selected+"> label").css("font-size",(newSize)+"px",'important' );
        $('#'+selected+"> input").css("font-size",(newSize)+"px",'important' );
      }else if($( "#"+selected ).find("select").length > 0){
        $('#'+selected+" > select").css("font-size",(newSize)+"px","important");
        $('#'+selected+" > option").css("font-size",(newSize)+"px","important");
      }else if($( "#"+selected ).find("a").length > 0){
        $('#'+selected+"> a").css("font-size",(newSize)+"px" );
      }
    }
  }

  $( "#fontSizeTableField" ).change(function() {
    setFontSize($( "#fontSizeTableField" ).val());
    updatePropriedades();
  });

  $( "#btAumentarFontSize" ).click(function(){
    var sizeTemp = getFontSize();
    setFontSize(++sizeTemp);
    updatePropriedades();
  });

  $( "#btDiminuirFontSize" ).click(function(){
    var sizeTemp = getFontSize();
    setFontSize(--sizeTemp);
    updatePropriedades();
  });

  $("#fs").change(function() {
    $('#'+selected).css("font-family", $(this).val(),"important");
    $('#'+selected+">label").css("font-family", $(this).val(),"important");
  });

  $( "#optionsListModal" ).on( "click", ".editOptionBt", function() {
    var field = $(this).parent().parent().find("input").focus();
  });

  $( "#optionsListModal" ).on( "click", ".removeOptionBt", function() {
    if(confirm("Você realmente deseja apagar essa opção?")){
      var field = $(this).parent().parent();
      field.hide();
      field.remove();
    }
  });

  $(".addNewOption").click(function(){
    $("#optionsListModal > tbody").append('<tr><td><input class="col s12" type="text" placeholder="Opção" value=""/></td><td>'+
    '<a href="#" class="col s6 btn amber waves-effect waves-light editOptionBt"><i class="material-icons">edit</i></a>'+
    '<a href="#" class="col s6 btn red accent-4 waves-effect waves-light removeOptionBt"><i class="material-icons">delete</i></a></td></tr>');
  });

  // load a file
  $("#file").on('change', readFile);
  function readFile (evt) {
    var files = evt.target.files;
    var file = files[0];
    var filename = files[0]['name'];
    var temp = filename.substr((filename.length)-5,5);
    if( temp == ".xfdl") {
      var reader = new FileReader();
      reader.onload = function() {
        openFileEditor(this.result);
      }
      reader.readAsText(file, 'ISO-8859-1');
    }else alert("Formato Inválido!");
  }

  function buildXMLForm(pageclass){
    var list = [];
    var xml = '<?xml version="1.0" encoding="UTF-8"?>\r\n<XFDL version="4.1.0" xmlns:xfdl="http://www.w3.org/TR/NOTE-XFDL" designer="MercuryForms-1.0">'+
    '\r\t<page sid="PAGE1" title="'+formName+'">'+
    '\r\t\t<global sid="global">\r\t\t\t<label>PAGE1</label>\r\t\t\t\<fontinfo>\r\t\t\t\t<fontname>Times New Roman</fontname>'+
    '\r\t\t\t\t<size>12</size>\r\t\t\t</fontinfo>\r\t\t</global>';
    $("."+pageclass).children().each(function(){
      var id = $( this ).attr("id");
      var nameField = id.split("-")[0];
      var x = $( this ).position().top.toFixed(2);
      var y = $( this ).position().left.toFixed(2);
      var newHeight = $( this ).height().toFixed(2);
      newHeight = Math.round( parseInt(newHeight,10)+1.83 );
      var newWidht = $( this ).width().toFixed(2);
      newWidht = Math.round( parseInt(newWidht,10)+1.83 );
      var value = $( this ).text();
      var label = "";
      var help = $( this ).attr("data-tooltip");
      var alinhamento = $( this ).css("textAlign");
      var fontname = $( this ).css("font-family");
      fontname = fontname.replace(/'/g,'');
      var fontSize = $( this ).css("font-size").replace('px', '');
      var effect = $( this ).css("font-style");

      if(nameField=="field"){
        value = $( this ).find("input").val();
        // label = value;
        label = "";
        fontSize = $( this ).find("input").css("font-size").replace('px', '');
      }else if(nameField=="label") {
        value = $( this ).find("p").text();
        fontSize = $( this ).find("p").css("font-size").replace('px', '');
      }else if(nameField=="button") {
        value = $( this ).find("a").text();
        fontSize = $( this ).find("a").css("font-size").replace('px', '');
      }else if(nameField=="radio"){
        label = $( this ).find("label").text();
        value = "off";
        fontSize = $( this ).find("label").css("font-size").replace('px', '');
      }else if(nameField=="check"){
        value = "off";
        label = $( this ).find("label").text();
        fontSize = $( this ).find("label").css("font-size").replace('px', '');
      }else if(nameField=="popup") {
        value = "";
      }

      xml+='\r\t\t<'+nameField+' sid="'+id+'">\r\n';
      xml+='\t\t\t<itemlocation>\r\n';
      xml+='\t\t\t\t<x>'+x+'</x>\r\n';
      xml+='\t\t\t\t<y>'+y+'</y>\r\n';
      xml+='\t\t\t\t<height>'+newHeight+'</height>\r\n';
      xml+='\t\t\t\t<width>'+newWidht+'</width>\r\n';
      xml+='\t\t\t</itemlocation>\r\n';
      if($.trim(value).length != 0) xml+='\t\t\t<value>'+value+'</value>\r\n';
      //if($.trim(label).length)
      if($.trim(label).length != 0) xml+='\t\t\t<label>'+label+'</label>\r\n';
      if($.trim(help).length != 0) xml+='\t\t\t<help>'+ help +'</help>\r\n';
      if(nameField=="radio") xml+='\t\t\t<group>'+$( this ).find("input").attr("name")+'</group>\r\n';
      if(nameField=="popup") xml+='\t\t\t<group>'+$( this ).find("select").attr("name")+'</group>\r\n';
      xml+='\t\t\t<justify>'+alinhamento+'</justify>\r\n';
      xml+='\t\t\t<fontinfo>\r\n';
      xml+='\t\t\t\t<fontname>'+fontname+'</fontname>\r\n';
      xml+='\t\t\t\t<size>'+fontSize+'</size>\r\n';
      xml+='\t\t\t\t<effect>'+effect+'</effect>\r\n';
      xml+='\t\t\t</fontinfo>\r\n';
      xml+='\t\t</'+nameField+'>';

      if(nameField=="popup") {
        var cellID = "CELL";
        $("#optionsListModal > tbody > tr").each(function(i,v){
          xml+='\r\t\t<cell sid="'+cellID+i+'">\r\n';
          xml+='\t\t\t<value>'+$(this).find("input").val()+'</value>\r\n';
          xml+='\t\t</cell>';
        });
      }

      list.push($(this));
    });
    xml+='\r\t</page>\r\n</XFDL>';
    if(list.length) return xml;
    else return null;
  }

  function setTitleForm(){
    if(typeof formName == 'undefined') formName = "semtítulo"
    document.title = "MERCURY FORMS :: Criação - "+formName+".XFDL";
    $("#formNameTitle").html("doc.name: "+formName);
  }

  $( "#salvarBt" ).click(function(){
    var xml=buildXMLForm();
    if(xml!=null){
      if (!is_nwjs()) {
        // on browser
        download(xml, formName+'.xfdl', 'application/xml');
      }else{
        // on webkit
        var fdialogs = require('node-webkit-fdialogs');
        var Dialog = new fdialogs.FDialog({
            type: 'save',
            accept: ['.xfdl'],
            path: '~/Downloads'
        });

        var content = new Buffer(xml, 'utf-8');
        Dialog.saveFile(content, function (err, path) {
            console.log("File saved in", path);    // notifier
            alert("Arquivo salvo com sucesso!");
        });
      }
    }else alert("Formulário vazio!");
  });

 function startNewForm(){
   if(opNew==1 && $("#formName").val().length > 0) {
       formName = $("#formName").val()
       setTitleForm();
       $("#preloaderModal").closeModal();
       $(".lean-overlay").remove();
   }else if(opNew==0 && $("#openFile").val().length > 0) {
     var file = $("#openFile").get(0).files[0];
     var filename = $("#openFile").get(0).files[0]['name'];
     var temp = filename.substr((filename.length)-5,5);
     if( temp == ".xfdl") {
       var reader = new FileReader();
       reader.onload = function() {
         openFileEditor(this.result);
         $("#preloaderModal").closeModal();
         $(".lean-overlay").remove();
       }
       reader.readAsText(file, 'ISO-8859-1');
     }else alert("Formato Inválido!");
   }//else alert("empty")
 }

  $("#okNewform").on("click",startNewForm);

  function renderElements(obj,name,readOrWrite){
    var $newElementScript = $('');
    var value = obj.find('value').text();
    var label = obj.find('label').text();
    var x = obj.find('itemlocation').find('x').text();
    var y = obj.find('itemlocation').find('y').text();
    var width = obj.find('itemlocation').find('width').text();
    var height = obj.find('itemlocation').find('height').text();
    var help = obj.find('help').text();
    var id = obj.attr('sid');
    var idtemp = id+"";
    var newIdTEMP = idtemp.split("-")[1];
    var alinhamento = obj.find("justify").text();
    var fontname = obj.find("fontinfo").find("fontname").text();
    var fontSize = obj.find("fontinfo").find("size").text();
    var effect = obj.find("fontinfo").find("effect").text();

    if(name=="label"){
      if(typeof id == 'undefined') return true;
      $newElementScript = $("<div class='ui-widget-content componentes ui-draggable "+
      "ui-draggable-handle ui-droppable canvas-element element ui-resizable tooltipped'"+
      " data-position='bottom' data-delay='50'><p>"+value+"</p></div>");
      $newElementScript.css("textAlign",alinhamento);
      $newElementScript.css("font-size",fontSize+"px","important");
      $newElementScript.css("font-family",fontname);
      $newElementScript.css("font-weight",effect);
      $newElementScript.css('background-color', 'inherit');
    }else if(name=="field"){
      $newElementScript = $("<div class='ui-widget-content componentes ui-draggable "+
      "ui-draggable-handle ui-droppable canvas-element element ui-resizable tooltipped'"+
      " data-position='bottom' data-delay='50'><input type='text' value='"+value+"'/></div>");
      $newElementScript.find("input").css("textAlign",alinhamento);
      $newElementScript.find("input").css("font-size",fontSize+"px","important");
      $newElementScript.css("font-family",fontname);
      $newElementScript.find("input").css("font-weight",effect);
    }else if(name=="radio"){
      $newElementScript = $("<div class='ui-widget-content componentes ui-draggable"+
      "ui-draggable-handle ui-droppable canvas-element element ui-resizable tooltipped'"+
      "  data-position='bottom' data-delay='50'><input type='radio' name='"+obj.find("group").text()+
      "' value='"+value+"' id='radioBt' disabled/><label class='labelRadio' for='radioBt'>"+label+"</label></div>");
      $newElementScript.find("label").css("textAlign",alinhamento);
      $newElementScript.find("label").css("font-size",fontSize+"px","important");
      $newElementScript.find("input").css("font-size",fontSize+"px","important");
      $newElementScript.css("font-family",fontname);
      $newElementScript.find("label").css("font-weight",effect);
    }else if(name=="check"){
      $newElementScript = $("<div class='ui-widget-content componentes ui-draggable"+
      "ui-draggable-handle ui-droppable canvas-element element ui-resizable tooltipped'"+
      "  data-position='bottom' data-delay='50'><input type='checkbox'"+
      "' value='"+value+"' id='filled-in-box' checked disabled/><label class='labelRadio' for='filled-in-box'>"+label+"</label></div>");
      $newElementScript.find("label").css("textAlign",alinhamento);
      $newElementScript.find("label").css("font-size",fontSize+"px","important");
      $newElementScript.find("input").css("font-size",fontSize+"px","important");
      $newElementScript.css("font-family",fontname);
      $newElementScript.find("label").css("font-weight",effect);
    }else if(name=="popup"){
      $newElementScript = $("<div class='ui-widget-content componentes ui-draggable"+
      "ui-draggable-handle ui-droppable canvas-element element ui-resizable tooltipped'"+
      "  data-position='bottom' data-delay='50'><select name='"+obj.find("group").text()+
      "' class='browser-default' disabled><option value='0' disabled selected>Caixa de selecão</option></select></div>");
      // $newElementScript.find("label").css("textAlign",alinhamento);
      $newElementScript.css("font-size",fontSize+"px","important");
      // $newElementScript.find("option").css("font-size",fontSize+"px","important");
      $newElementScript.css("font-family",fontname);
      $newElementScript.css("font-weight",effect);
      $("#optionsListModal > tbody > tr").first().remove();
      var popupTEMP = obj.parent().find("cell").each(function(){
        var popupValue = $(this).find("value").text();
        $("#optionsListModal > tbody").append('<tr><td><input class="col s12" type="text" placeholder="Opção" value="'+popupValue+'"/></td><td>'+
        '<a href="#" class="col s6 btn amber waves-effect waves-light editOptionBt"><i class="material-icons">edit</i></a>'+
        '<a href="#" class="col s6 btn red accent-4 waves-effect waves-light removeOptionBt"><i class="material-icons">delete</i></a></td></tr>');
      });
    }else if(name=="button"){
      $newElementScript = $("<div class='ui-widget-content componentes ui-draggable "+
      "ui-draggable-handle ui-droppable canvas-element element ui-resizable tooltipped'"+
      " data-position='bottom' data-delay='50'><a class='waves-effect grey darken-1 white-text"+
      " waves-light btn col s12' disabled>"+value+"</a></div>");
      $newElementScript.find("a").css("textAlign",alinhamento);
      $newElementScript.find("a").css("font-size",fontSize+"px","important");
      $newElementScript.css("font-family",fontname);
      $newElementScript.find("a").css("font-weight",effect);
    }

    // var $newElement = $newElementScript;
    $newElementScript.attr("id",id);
    if(help!=""){
      $newElementScript.attr("data-tooltip",help);
      $newElementScript.tooltip();
    }
    $newElementScript.width(width);
    $newElementScript.height(height);
    $newElementScript.css({
      top: x+"px",
      left: y+"px",
      position: 'absolute'
    });
    if(readOrWrite!='r'){
      $newElementScript.draggable({
        containment: '#droppable',
        cursor: 'move',
        opacity: 0.6
      });
      $newElementScript.resizable({
        grid: 20
      });
    }
    newId = newIdTEMP+1;
    return $newElementScript;
  }

  function openFileEditor(file){
    $( ".page ").html("");
    $(file).find('page').each(function(){
      $(this).find("label").each(function(){
        var $elementTemp = renderElements($(this),"label");
        if($elementTemp!=true) $( ".page ").append($elementTemp);
      });
      $(this).find("field").each(function(){
        $( ".page ").append(renderElements($(this),"field"));
      });
      $(this).find("radio").each(function(){
        $( ".page ").append(renderElements($(this),"radio"));
      });
      $(this).find("popup").each(function(){
        $( ".page ").append(renderElements($(this),"popup"));
      });
      $(this).find("button").each(function(){
        $( ".page ").append(renderElements($(this),"button"));
      });
      $(this).find("check").each(function(){
        $( ".page ").append(renderElements($(this),"check"));
      });
      formName = $(this).attr("title");
      setTitleForm();
    });
  }

  //mover elemento
  $(document).keydown(function(e) {
    if((selected.length) && (!$("#valorTableField").is(":focus")) && (!$("#descTableField").is(":focus")) && (!$("#fontSizeTableField").is(":focus"))) {
      switch (e.which) {
        case 37:
        if(selected.length){
          $('#'+selected).stop().animate({
            left: '-=10'
          }); //left arrow key
        }
        break;
        case 38:
        if(selected.length){
          $('#'+selected).stop().animate({
            top: '-=10'
          }); //up arrow key
        }
        break;
        case 39:
        if(selected.length){
          $('#'+selected).stop().animate({
            left: '+=10'
          }); //right arrow key
        }
        break;
        case 40:
        if(selected.length){
          $('#'+selected).stop().animate({
            top: '+=10'
          }); //bottom arrow key
        }
        break;
      }
  }
  });

function download(strData, strFileName, strMimeType) {
  var D = document,
  A = arguments,
  a = D.createElement("a"),
  d = A[0],
  n = A[1],
  t = A[2] || "text/plain";

  //build download link:
  a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);

  if (window.MSBlobBuilder) { // IE10
    var bb = new MSBlobBuilder();
    bb.append(strData);
    return navigator.msSaveBlob(bb, strFileName);
  } /* end if(window.MSBlobBuilder) */

  if ('download' in a) { //FF20, CH19
    a.setAttribute("download", n);
    a.innerHTML = "downloading...";
    D.body.appendChild(a);
    setTimeout(function() {
      var e = D.createEvent("MouseEvents");
      e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      D.body.removeChild(a);
    }, 66);
    return true;
  }; /* end if('download' in a) */

  //do iframe dataURL download: (older W3)
  var f = D.createElement("iframe");
  D.body.appendChild(f);
  f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
  setTimeout(function() {
    D.body.removeChild(f);
  }, 333);
  return true;
}

var opNew = 1;

$('input:radio[name="groupNew"]').change(function() {
  if ($(this).val() == 'new') {
    opNew=1;
    $("#divOpen").hide();
    $("#divNew").show();
  } else {
    opNew=0;
    $("#divNew").hide();
    $("#divOpen").show();
  }
});


//PARTE DA PAGINAÇÃO
/* PARA A PAGINCAO FUNCIONAR*/
var rangePagination = 10;
var tableSize = 0;
var numberPages = 0;
var currentPage = 1;
var okPagination = 1;
function pagination(init) {
    if (okPagination == 1) {
        tableSize = $("#result > #table > tbody").children().length;
        numberPages = Math.ceil(tableSize / rangePagination);
        okPagination = 0;
    }
    var limit0 = rangePagination * (init - 1);
    var limit1 = rangePagination * init;
    $("table > tbody").find("tr").each(function (l) {
        if (l >= limit0 && l < limit1)
            $(this).show();
        else
            $(this).hide();
    });
    if (init == 1)
        $(".pagination").html('<li class="disabled"><a href="#!"><i class="material-icons">chevron_left</i></a></li>');
    else
        $(".pagination").html('<li><a href="#!"><i class="material-icons">chevron_left</i></a></li>');

    for (var i = 1; i <= numberPages; i++)
        $(".pagination").append('<li class="waves-effect"><a href="#!">' + i + '</a></li>');

    if (init == numberPages)
        $(".pagination").append('<li class="disabled"><a href="#!"><i class="material-icons">chevron_right</i></a></li>');
    else
        $(".pagination").append('<li><a href="#!"><i class="material-icons">chevron_right</i></a></li>');
    $(".pagination > li:eq(" + init + ")").addClass("active grey darken-3");
    currentPage = init;
}

$("body").on("click", ".pagination > li", function () {
    if ((isNaN($(this).text())) && (!$(this).hasClass("disabled"))) {
        if ($(this).text() == "chevron_right")
            pagination(++currentPage);
        else if ($(this).text() == "chevron_left")
            pagination(--currentPage);
    } else if (!isNaN($(this).text()))
        pagination($(this).text());
});

function fillGraph() {
    var $titleGrafico = $("#tituloInput").val();
    var $dataValues = $("#precisaoInput").val();
    $('#grafico').highcharts({
        chart: {
            type: 'line'
        },
        xAxis: {
            categories: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']
        },
        yAxis: {
            title: {
                text: 'Precisão'
            },min: 0, max: 100,
            tickInterval: 5,
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: 'Revocação',
            data: $dataValues
        }]
    });
}

});
