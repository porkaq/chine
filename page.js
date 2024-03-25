actions = {};
changeview_to = null;
changeview_delay = 500;

function Page()
{
	this.sidebar = '';
	this.css = [];
	this.js = [];
	storage_params = localStorage.getItem( 'inrtu_page_params' );
	if ( storage_params == null ) {
		this.params = {};
	}
	else {
		this.params = JSON.parse( storage_params );
	}
	if ( this.params.view == undefined ) {
		this.params.view = {};
	}
	this.saveParams = function()
	{
		localStorage.setItem( 'inrtu_page_params', JSON.stringify( this.params ) );
	}
	this.SetView = function( params = {} )
	{
		if ( params.param_name != undefined ) {
			if ( !this.params.view.hasOwnProperty( params.param_name ) || this.params.view[ params.param_name ] != params.param_value ) {
				this.params.view[ params.param_name ] = params.param_value;
			}
			else {
				delete this.params.view[ params.param_name ];
			}
			this.saveParams();
		}
		let body_cls = $( 'body' ).attr( 'class' );
		if ( body_cls == undefined ) {
			body_cls = '';
		}
		let cls_arr = body_cls.split( /\s+/ );
		// удаляем прошлые настройки
		let remove_cls = [];
		let button_usl_cls = [];
		for ( i=0; i<cls_arr.length; i++ )
		{
			let tmp_arr = cls_arr[ i ].split( '-' );
			if ( tmp_arr.length > 2 && tmp_arr[ 0 ] == 'page' && tmp_arr[ 1 ] == 'view' ) {
				remove_cls.push( cls_arr[ i ] );	
				button_usl_cls.push( 'special-' + tmp_arr[ 2 ] );
			}
		}
		if ( remove_cls.length > 0 ) {
			$( 'body' ).removeClass( remove_cls.join( ' ' ) );
		}
		let add_cls = [];
		let button_sl_cls = [];
		for( key in this.params.view )
		{
			add_cls.push( 'page-view-' + key + '-' + this.params.view[ key ] );
			button_sl_cls.push( 'special-' + key + '-' + this.params.view[ key ] );
		}
		if ( button_usl_cls.length > 0 ) {
			$( '.' + button_usl_cls.join( ', .' ) ).removeClass( 'special-variant-active' );
		}
		if ( button_sl_cls.length > 0 ) {
			$( '.' + button_sl_cls.join( ', .' ) ).addClass( 'special-variant-active' );
		}
		if ( add_cls.length > 0 ) {
			$( 'body' ).addClass( add_cls.join( ' ' ) );
		}
		actions.startChangeView();
	}
	
	this.addCSS = function ( params ) 
	{
		let loading = true;
		for ( let i = 0; i < this.css.length; i++ )
		{
			if ( params.file == this.css[ i ] ) {
				loading = false;
			}
		}
		if ( !loading ) return false;
		let css_link = document.createElement( 'link' );
		css_link.setAttribute( 'rel', 'stylesheet' );
		css_link.setAttribute( 'type', 'text/css' );
		css_link.setAttribute( 'href', params.file );
		document.getElementsByTagName( 'head' )[0].appendChild( css_link );
		this.css.push( params.file );
	}	
	
	this.addJS = function ( params ) 
	{
		let loading = true;
		for ( let i = 0; i < this.js.length; i++ )
		{
			if ( params.file == this.js[ i ] ) {
				loading = false;
			}
		}
		if ( !loading ) return false;
		let js_link = document.createElement( 'script' );
		js_link.setAttribute( 'type', 'text/javascript' );
		js_link.setAttribute( 'src', params.file );
		document.getElementsByTagName( 'head' )[0].appendChild( js_link );
		return js_link;
	}
	$( document ).ready( $.proxy( this.SetView, this ) );
};
page = new Page();

actions.startChangeView = function ()
{
	if ( changeview_to != null ) {
		clearTimeout( changeview_to );
	}
	changeview_to = setTimeout( actions.changeView, changeview_delay );
}
actions.changeView = function ()
{
	$( window ).trigger( 'changeView' ); 
	changeview_timeout = null;
}

$( document ).ready( function () {
	let actions_collection = $( '.actions' ).filter( function () { return $( this ).parent().closest( '.actions' ).length == 0 } );
	actions_collection.on( 'click', function ( e ) {
		let target = $( e.target ).closest( '.action' );
		if ( target.length == 1 ) {
			let action_params = target.data( 'params' );
			if ( typeof action_params == 'string' && action_params != '' ) {
				action_params = JSON.parse( action_params.replace( /\'/g, '"' ) );
			}
			if ( action_params != undefined && typeof actions[ action_params.action ] == 'function' ) {
				action_params.obj = target;
				action_params.obj_event = e;
				return actions[ action_params.action ]( action_params );
			}
		}
	});
	$( '.to-zoom' ).addClass('action link').data( 'params', {
		'action': 'zoomImage'
	});
	$( window ).on( 'resize', function ( e ) { 
		actions.startChangeView();
	});
	
});

actions.zoomImage = function ( params )
{
	let width = params.obj.width();
	let nwidth = params.obj[ 0 ].naturalWidth;
	if ( nwidth > width && nwidth / width > 2 ) {
		zoomImageModal = new Modal();
		if ( params.obj.attr( 'description' ) != '' ) {
			let img = $( '<img>', {
				'src': params.obj[ 0 ].src
			});
			let img_block = $( '<div>', {
				'class': 'modal-center-content'
			});
			img_block.append( img );
			zoomImageModal.addTitle( params.obj.attr( 'description' ) )
			.appendContent( img_block )
			.show();
		}
	}
}

actions.SidebarSwitch = function ( params )
{
	if ( params[ 'content' ] == undefined ) {
		params[ 'content' ] = '.sidebar-menu';
	}
	if ( $( '.sidebar' ).hasClass( 'open' ) && ( params[ 'content' ] == page.sidebar || params[ 'content' ] == '.sidebar-menu' ) ) {
			$( '.sidebar' ).removeClass( 'open' );
			$( '.sidebar .sidebar-content' ).removeClass( 'sidebar-content-active' ).scrollTop( 0 );
			$( 'body' ).removeClass( 'scroll-fix' );
			$( '.sidebar-switchbutton' ).attr( 'description', 'развернуть меню' );
			$( '.sidebar-specialbutton' ).attr( 'description', 'развернуть настройки для слабовидящих' );
	}
	else {
		$( '.sidebar .sidebar-content' ).removeClass( 'sidebar-content-active' );
		$( '.sidebar ' + params[ 'content' ] ).addClass( 'sidebar-content-active' );
		$( '.sidebar' ).addClass( 'open' );
		$( 'body' ).addClass( 'scroll-fix' );
		if ( params[ 'content' ] == '.sidebar-menu' ) {
			$( '.sidebar-switchbutton' ).attr( 'description', 'свернуть меню' );
		}
		else if ( params[ 'content' ] == '.sidebar-special' ) {
			$( '.sidebar-switchbutton' ).attr( 'description', 'свернуть настройки для слабовидящих' );
			$( '.sidebar-specialbutton' ).attr( 'description', 'свернуть настройки для слабовидящих' );
		}
		page.sidebar = params[ 'content' ];
	}
}

actions.SetView = function ( params = {} )
{
	page.SetView( params );
}

function topMenu ()
{
	this.Init = function ()
	{
		this.obj = $( '.menu-top' );
		if ( this.obj.length == 1 ) {
			this.item = this.obj.children( 'li' );
			for ( let i = 0; i < this.item.length; i++ )
			{
				let submenu = $( this.item[ i ] ).children( 'ul' );
				if ( submenu.length > 0 ) {
					let subdiv = $( '<div>', {
						'class': 'menu-top-dropblock'
					});
					let dropcont = $( '<div>', {
						'class': 'menu-top-dropcont'
					});
					dropcont.append( submenu );
					subdiv.append( dropcont );
					$( this.item[ i ] ).append( subdiv );
					subdiv.css( 'height', '0' );
					$( this.item[ i ] ).on( 'click', $.proxy( this.openSubmenu, this ) );
				}
			}
		}
	}
	this.openSubmenu = function ( e )
	{
		let item = $( e.target ).closest( 'li' );
		let subdiv = item.children( '.menu-top-dropblock' );
		if ( subdiv.length == 1 ) {
			let dropcont = subdiv.children( '.menu-top-dropcont' );
			let h = 0;
			if ( !item.hasClass( 'active' ) ) {
				h = dropcont.outerHeight( true );
				item.addClass( 'active' )
			}
			else {
				item.removeClass( 'active' )
			}
			subdiv.css( 'height', h + 'px' );
			return false;
		}
	}
	$( document ).ready( $.proxy( this.Init, this ) );
}
new topMenu();

actions.goURL = function ( params = {} )
{
	if ( params.url != undefined ) {
		if ( params.target != undefined && params.target == 'blank' ) { //!!! сделал 24.01 . Вроде браузеры не любят функцию .open(), но на хроме и яндексе открывается
			window.open( params.url );
		} else {
			document.location.href = params.url;
		}
	}
}

actions.window = function ( params = {} )
{
	params.url = params.obj.attr( 'href' );
	params.text = params.obj.text();
	if ( params.url != undefined ) {
		window.open( params.url, params.text,'status=0,toolbar=0,width=650,height=500' );
	}
	return false;
}