var slider_items = {};
var sliders = [];
$( document ).ready( function () {
	$( '.slider' ).each( function () {
		new Slider({
			'obj': this
		});

	});
	// $('.that-button').on( 'click', function () {
	// 	let slider_item = $( '<div>', {
	// 		class: 'slider-item',
	// 	} ).css( 'background-color', 'green' );
	// 	slider_item.appendTo( sliders[ 0 ].obj );
	// 	sliders[0].checkItems();
	// } )
	// $('.that-button').on( 'contextmenu', function ( e ) {
	// 	e.preventDefault();
	// 	let slider_item = $( '<div>', {
	// 		class: 'slider-item',
	// 	} ).css( 'background-color', 'grey' );
	// 	slider_item.prependTo( sliders[ 0 ].obj );
	// 	sliders[0].checkItems();
	// } )
});

class Slider
{
	components_array = { 'arrows': false, 'thumbnails': false, 'expandWrapper': false, 'markers': false, 'gallery_markers': false };
	default_values = { 'delay_value': 5 * 1000, 'touch_slide': true, 'class': "", 'isReSize': false };
	constructor( params ) {
		this.obj = $( params.obj );
		sliders.push( this );
		this.item_class = params.item_class || SliderItem;
		this.items = [];
		this.current_id = 0;
		this.max_height = this.obj.height();
		this.to = null;
		this.params = {};
		if ( this.obj.data( 'params' ) != undefined ) this.params = JSON.parse( this.obj.data( 'params' ).replace( /(?<!\\)\'/gm, "\"" ) ); 
		this.mergeParams( params );
		this.makeDefaultValues( params );
		 //this.delay_value = ( this.params.delay_value * 1000 ) || ( 5 * 1000 );
		 //this.touch_slide = this.params.touch_slide || true;
		 //this.class = this.params.class || "";
		this.makeComponents();
		this.checkItems( params );
		
		this.bindEvents();
		this.start();
	}
	start()
	{
		this.toSlide({
			'target_id': 0,
			'user_activity': false,
			'first': true
		});
	}
	mergeParams( params )
	{
		Object.assign( this.params, params );
	}
	makeDefaultValues ( params )
	{
		if ( params.default_values == undefined ) params.default_values = {};
		Object.assign( this.default_values, params.default_values );
		for ( const prop in this.default_values ) 
		{
			if ( this.params[ prop ] != undefined ) {
				if ( prop == 'delay_value' ) this.params[ prop ] *= 1000
				this[ prop ] = this.params[ prop ];
			} else {
				this[ prop ] = this.default_values[ prop ];
			}
		}
	}
	makeComponents()
	{
		if ( this.params ) {
			if ( this.params.components != undefined && this.params.components != '' ) {
				let components = this.params.components;
				for ( let i = 0; i < components.length; i++ )
				{
					if ( this.params.components.includes( components[ i ] ) ) {
						if ( typeof this[ 'build_' + components[ i ] ] == 'function' ) {
							this[ 'build_' + components[ i ] ]();
						}
						this.components_array[ components[ i ] ] = true;
					}
				}
			}
			else {
				this.params.components = {};
			}

			// for ( const prop in this.params ) 
			// {
			// 	if ( this.params[ prop ] === true ) {
			// 		if ( typeof this[ 'make_' + prop ] == 'function' ) {
			// 			this[ 'make_' + prop ]();
			// 		}
			// 		this[ 'is_' + prop ] = true;
			// 	}
			// }
		}
		else {
			this.params = {};
		}
		this.run = this.params.autostart == undefined ? false : this.params.autostart;  
		//this.isReSize = this.params.isReSize == true ? true : false;
	}
	build_markers()
	{
		if ( this.markers == undefined ) {
			this.markers = $( '<div>', {
				'class': 'slider-markers'
			});
			this.obj.append( this.markers );
		}
	}
	build_arrows()
	{
		this.arrows = [];
		if ( this.items.length != 1 && ( this.leftArrowWrapper == undefined || this.rightArrowWrapper == undefined ) ) {
			this.leftArrowWrapper = $( '<div>', {
				class: 'slider-arrow-wrapper slider-arrow-left-wrapper action'
			});
			this.leftArrowWrapper.data('params', {
				'action': 'slideHandler',
				'slider': this,
				'delta': -1,
			});
			this.leftArrow = $( `<svg class="slider-arrow slider-arrow-left" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 32" stroke="currentColor" stroke-width="3.5">
				<path d="M4 4 L16 16 L4 28"/></svg>` ).appendTo( this.leftArrowWrapper );
			this.arrows.push( this.leftArrowWrapper );
			this.obj.append( this.leftArrowWrapper );
			this.rightArrowWrapper = $( '<div>', {
				class: 'slider-arrow-wrapper slider-arrow-right-wrapper action'
			});
			this.rightArrowWrapper.data('params', {
				'action': 'slideHandler',
				'slider': this,
				'delta': 1,
			});
			this.rightArrow = $( `<svg class="slider-arrow slider-arrow-right" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 32" stroke="currentColor" stroke-width="3.5">
				<path d="M4 4 L16 16 L4 28"/></svg>` ).appendTo( this.rightArrowWrapper );
			this.arrows.push( this.rightArrowWrapper );
			this.obj.append( this.rightArrowWrapper );
		}
	}
	
	showComponents()
	{
		for ( let item in this.components_array )
		{
			if ( typeof this[ item ] == 'object' ) {
				if ( Array.isArray( this[ item ] ) ) {
					this[ item ].forEach( el => {
						el.removeClass( 'none' );
					} );
				} else {
					this[ item ].removeClass( 'none' );
				}
			}
		}
		this.isComponentsHidden = false;
	}
	hideComponents()
	{
		for ( let item in this.components_array )
		{
			if ( typeof this[ item ] == 'object' ) {
				if ( Array.isArray( this[ item ] ) ) {
					this[ item ].forEach( el => {
						el.addClass( 'none' );
					} );
				} else {
					this[ item ].addClass( 'none' );
				}
				if ( typeof this[ 'hide_' + item ] == 'function' ) {
					this[ 'hide_' + item ]();
				}
			}
		}
		this.isComponentsHidden = true;
	}

	checkItems( params = {} )
	{
		this.items.forEach( e => {
			if ( !$.contains( this.obj[ 0 ], e.obj[ 0 ] ) ) e.remove();
		} )
		this.items = [];
		let items = $( '.slider-item', this.obj );
		let id_flag = false;
		let temp_current = this.current_id;
		for ( let i = 0; i < items.length; i++ )
		{
			let item_params = $( items[ i ] ).data( 'params' );
			let item;
			if ( item_params == undefined || item_params.slider_item_obj == undefined ) {
				item = new this.item_class ({
					'slider': this,
					'obj': $( items[ i ] ),
					'id': i
				});
			}
			else {
				item = item_params.slider_item_obj;
				if ( item.id == temp_current ) {
					id_flag = true;
					this.current_id = i;
				}
				item.setID({
					'id': i
				});
			}
			item.obj.trigger( 'slider-item.checkComponents' );
			this.items.push( item );
		}
		if ( !id_flag ) {
			this.current_id = 0;
			this.toSlide({
				'target_id': 0,
				'user_activity': false,
				'first': true
			});
		}
		if ( this.items.length == 0 ) {
			this.isHidden = true;
			this.obj.addClass( 'none' );
			return false;
		} else if ( this.items.length == 1 ) {
			this.hideComponents();
			return false;
		} else if ( this.isHidden ) {
			this.obj.removeClass( 'none' );
		} else if ( this.isComponentsHidden ) {
			this.showComponents();
		}
	}

	getDelay( params = {} )
	{
		let delay_value;
		let target_id = params.target_id == undefined ? this.current_id : params.target_id;
		if ( this.items[ this.current_id ] != undefined && this.items[ target_id ] != undefined && this.items[ target_id ].params.delay_value != undefined ) {
			delay_value = this.items[ target_id ].params.delay_value * 1000;
		}
		else {
			delay_value = this.delay_value;
		}

		if ( params.user_activity != undefined & params.user_activity ) {
			delay_value *= 3;
		} 
		return delay_value;
	}
	toSlide( params = {} )
	{
		if ( this.to != null ) {
			clearTimeout( this.to );
		}
		let target_id;
		let delta;
		if ( params.target_id != undefined ) {
			target_id = params.target_id;
			delta = target_id - this.current_id;
		}
		else if ( typeof params.item == 'object' ) {
			target_id = params.item.id;
			delta = target_id - this.current_id;
		}
		else {
			target_id = this.current_id;
			delta = 1;
			if ( params.delta != undefined ) {
				delta = params.delta;
			}
			target_id += delta;
		}
		if ( target_id > this.items.length - 1 ) {
			target_id = 0;
		}
		if ( target_id < 0 ) {
			target_id = this.items.length - 1;
		}
		let params2 = { target_id: target_id };
		let delay_value = this.getDelay( params2 );
		if ( delta > 0 ) {
			this.obj
			.addClass( 'slider-forward' )
			.removeClass( 'slider-backward' );
		}
		else if ( delta < 0 ) {
			this.obj
			.addClass( 'slider-backward' )
			.removeClass( 'slider-forward' );
		} else if ( params.first == undefined || !params.first ) {
			// if ( this.run ) {
			// 	this.to = setTimeout( $.proxy( function () { this.toSlide(); }, this ), delay_value );
			// }
			if ( this.items[ target_id ] != undefined ) {
				this.items[ target_id ].setActive({
					'delta': 0,
					'delay': 0
				});
			}
			return;
		} 

		if ( this.items[ this.current_id ] != undefined && target_id != this.current_id ) {
			this.items[ this.current_id ].setPassive({
				'delta': delta
			});
		}
		
		if ( this.items[ target_id ] != undefined ) {
			this.current_id = target_id;
			this.items[ target_id ].setActive({
				'delta': delta,
				'delay': delay_value
			});
		}
		if ( this.run ) {
			this.to = setTimeout( $.proxy( function () { this.toSlide(); }, this ), delay_value );
		}
	}

	reSize( params = {} )
	{
		if ( this.isReSize ) {
			this.max_height = this.obj.height();
			this.items.forEach( e => {
				e.toReSize = true;
			} );
		}
	}
	bindEvents( params = {} )
	{
		if ( this.touch_slide ) {
			this.obj[ 0 ].addEventListener( 'touchstart', ( e ) => {
				this.touch_start_x = e.changedTouches[ 0 ].pageX;
				this.touch_start_y = e.changedTouches[ 0 ].pageY;
				this.obj.addClass( 'touch-event' );
				document.body.addEventListener( 'touchend', ( e2 ) => {
					if ( this.touch_start_x != null && $( e.target ).closest( '.touch-event' ).length == 1 && Math.abs( e2.changedTouches[ 0 ].pageX - this.touch_start_x ) > 35 && Math.abs( e2.changedTouches[ 0 ].pageY - this.touch_start_y ) < 30 ) {
						let d;
						if ( e2.changedTouches[ 0 ].pageX - this.touch_start_x > 35 ) {
							d = -1;
						} else {
							d = 1;
						}
						actions.slideHandler( { action: 'slideHandler', slider: this, delta: d } );
					} else {
						this.touch_start_x = null;
					}
					this.obj.removeClass( 'touch-event' );
				}, { once: true });
			} );
		}
		$( window ).on( {
			'resize changeView': function () { this.reSize( params ) }.bind( this )
		} );
		this.reSize( params ); 
	}
	getNextID( params = {} )
	{
		let cur_id = params.id == undefined ? this.current_id : params.id;
		let id = this.items.length >= ( cur_id + 1 ) ? ( cur_id + 1 ) - this.items.length : cur_id + 1;
		return id;
	}
	getPrevID( params = {} )
	{
		let cur_id = params.id == undefined ? this.current_id : params.id;
		let id = cur_id < 0 ? this.items.length - id : id;
		return id;
	}
}

class SliderItem
{
	constructor ( params ) {
		this.obj = $( params.obj );
		this.slider = params.slider;
		this.params = {};
		if ( this.obj.data( 'params' ) != undefined && !$.isEmptyObject( this.obj.data( 'params' ) ) ) this.params = JSON.parse( this.obj.data( 'params' ).replace( /\'/gm, "\"" ) );
		this.buildDOM();
		this.setID({
			'id': params.id
		});
		this.obj.on( 'transitionend', function () { this.setStop() }.bind( this ) );
		this.obj.on( 'slider-item.checkComponents', function () { this.checkComponents() }.bind( this ) );
		this.params.slider_item_obj = this;
		this.obj.on( 'slider-item.active', function () { this.reSize() }.bind( this ) );
		this.obj.data('params', this.params );
		return this;
	}

	reSize()
	{
		if ( this.toReSize ) {
			let height;
			let el = this.obj.children( '.resize' )
			if ( el.length == 1 ) {
				height = el.outerHeight();
			} else {
				height = this.obj.outerHeight();
			}
			this.slider.max_height = height > this.slider.max_height ? height : this.slider.max_height;
			this.slider.max_height = this.slider.max_height > 900 ? 900 : this.slider.max_height;
			this.slider.obj.css( 'height', this.slider.max_height + 'px' );
		}
	}

	setActive( params = {} )
	{
		if ( this.params.base_color != undefined ) {
			this.slider.obj.css( '--banner-base-color', this.params.base_color );
		} else {
			this.slider.obj.css( '--banner-base-color', 'var(--page-fg-color)' );
		}
		if ( params.delta != 0 ) {
			this.obj
			.removeClass( 'slider-item-out' )
			.addClass( 'slider-item-over' );
			this.obj.height();
		}
		this.obj.addClass( 'slider-item-active' );
		if ( typeof this.marker == 'object' ) {
			if ( params.delay != 0 ) {
				this.marker[ 0 ].style.WebkitAnimationDuration = ( params.delay / 1000 ) + 's';
			} else {
				this.marker.addClass( 'stay-active' );
			}
			this.marker.addClass( 'slider-item-marker-active' );
		}
		this.obj.trigger( 'slider-item.active', [ this.id ] );
	};

	setPassive( params = {} )
	{
		this.obj
		.removeClass( 'slider-item-active' )
		.removeClass( 'slider-item-over' )
		.addClass( 'slider-item-out' );
		if ( typeof this.marker == 'object' ) {
			this.marker
			.removeClass( 'slider-item-marker-active' )
			.removeClass( 'stay-active' );
		}
		this.obj.trigger( 'slider-item.passive', [ this.id ] );
	};

	setStop()
	{
		this.obj
		.removeClass( 'slider-item-over' )
		.removeClass( 'slider-item-out' );
	};
	
	setID( params )
	{
		this.id = params.id;
	}

	buildDOM( params = {} )
	{
		if ( typeof this.slider.markers == 'object' ) {
			this.marker = $( '<div>', {
				'class': 'slider-item-marker action'
			});
			this.marker.data('params', {
				action: 'slideHandler',
				item: this,
				slider: this.slider
			});
		}
	}

	checkComponents ()
	{
		if ( this.marker != undefined ) {
			this.slider.markers.append( this.marker );
		}
	}
	remove ()
	{
		this.obj.remove();
		this.marker.remove();
	}
}


actions.slideHandler = function ( params = {} )
{
	if ( typeof params.slider == 'object' ) { 
			params.user_activity = true;
			params.slider.toSlide( params );
	}
}




