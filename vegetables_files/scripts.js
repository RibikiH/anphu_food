function getCartAjax(){
	var cart = null;
	$('#cartform').hide();
	$('#myCart #exampleModalLabel').text("Giỏ hàng");
	jQuery.getJSON('/cart.js', function(cart, textStatus) {
		if(cart)
		{
			$('#cartform').show();
			$('.line-item:not(.original)').remove();
			$.each(cart.items,function(i,item){
				var total_line = 0;
				var total_line = item.quantity * item.price;
				tr = $('.original').clone().removeClass('original').appendTo('table#cart-table tbody');
				if(item.image != null)
					tr.find('.item-image').html("<img src=" + Haravan.resizeImage(item.image,'small') + ">");
				else
					tr.find('.item-image').html("<img src='//hstatic.net/0/0/global/noDefaultImage6_large.gif'>");
				vt = item.variant_options;
				if(vt.indexOf('Default Title') != -1)
					vt = '';
				tr.find('.item-title a').html(item.product_title + '<br><span>' + vt + '</span>').attr('href', item.url);
				tr.find('.item-quantity').html("<input id='quantity1' name='updates[]' min='1' type='number' value=" + item.quantity + " class='' />");
				if ( typeof(formatMoney) != 'undefined' ){
					tr.find('.item-price').html(Haravan.formatMoney(total_line, formatMoney));
				}else {
					tr.find('.item-price').html(Haravan.formatMoney(total_line, ''));
				}
				tr.find('.item-delete').html("<a href='#' onclick='deleteCart(" + item.variant_id + ")' >Xóa</a>");
			});
			if ( typeof(formatMoney) != 'undefined' ){
				$('.item-total').html(Haravan.formatMoney(cart.total_price, formatMoney));
			}else {
				$('.item-total').html(Haravan.formatMoney(cart.total_price, ''));
			}
			$('.modal-title b').html(cart.item_count);
			$('*[id=cart-count]').html(cart.item_count);
			if(cart.item_count == 0){
				//$('#myCart button').attr('disabled', '');
				$('#myCart #cartform').addClass('hidden');
				$('#myCart #exampleModalLabel').html('Giỏ hàng của bạn đang trống. Mời bạn tiếp tục mua hàng.');
			}
			else{
				$('#myCart #exampleModalLabel').html('Bạn có ' + cart.item_count + ' sản phẩm trong giỏ hàng.');
				$('#myCart #cartform').removeClass('hidden');
				$('#myCart button').removeAttr('disabled');
			}

		}
		else{
			$('#myCart #exampleModalLabel').html('Giỏ hàng của bạn đang trống. Mời bạn tiếp tục mua hàng.');
			$('#cartform').hide();
		}
	});

}
function deleteCart(variant_id){
	var params = {
		type: 'POST',
		url: '/cart/change.js',
		data: 'quantity=0&id=' + variant_id,
		dataType: 'json',
		success: function(cart) {
			getCartAjax();
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}
function getCartView() {
	jQuery.getJSON('/cart.js', function(cart, textStatus) {
		jQuery('.ajax_cart_quantity').html(cart.item_count);
		jQuery('.ajax-price-head').html(Haravan.formatMoney(cart.total_price, ""));
		jQuery('#view-cart .text-mini-cart').remove();
		jQuery('#view-cart .cart-check-mini').remove();
		jQuery('#view-cart').append(
			"<div class='text-mini-cart'><span class='text-left'>Tổng tiền:</span><span class='cart_block_total'>" + Haravan.formatMoney(cart.total_price,'') + "</span></div><div class='cartpro-actions cart-check-mini'><a class='button cart-link' href='/cart'>Giỏ hàng</a><a class='button checkout-button' href='/checkout'>Thanh toán</a></div>"
		);
		jQuery.each(cart.items,function(i,item){
			clone_item(item);
		});
	});
};
function clone_item(product){
	var item_product = jQuery('#clone-item .item_2');
	item_product.find('img').attr('src',product.image);
	item_product.find('a:not(.remove-cart)').attr('href', product.url);
	item_product.find('.text_cart > h4 > a').html(product.title);
	var variant = '';
	jQuery.each(product.variant_options,function(i,v){
		variant = variant + ' ' + v;
	});
	item_product.find('.remove-cart').attr('data-id',product.variant_id);
	item_product.find('.variant').html(variant);
	item_product.find('.price-line .new-price').html(Haravan.formatMoney(product.price,"") + "<span class='down-case'> x " + product.quantity + "</span>");
	item_product.clone().removeClass('hidden').prependTo('#view-cart');
}

$(document).ready(function(){
	$('#cart-target a').click(function(event){
		event.preventDefault() ;
		getCartAjax();

		$('#myCart').modal('show');
		$('.modal-backdrop').css({'height':$(document).height(),'z-index':'99'});
	});

	$('#update-cart-modal').click(function(event){
		event.preventDefault();
		if (jQuery('#cartform').serialize().length <= 5) return;
		$(this).html('Đang cập nhật');
		var params = {
			type: 'POST',
			url: '/cart/update.js',
			data: jQuery('#cartform').serialize(),
			dataType: 'json',
			success: function(cart) {
				if ((typeof callback) === 'function') {
					callback(cart);
				} else {

					getCartAjax();
				}

				$('#update-cart-modal').html('Cập nhật');
			},
			error: function(XMLHttpRequest, textStatus) {
				Haravan.onError(XMLHttpRequest, textStatus);
			}
		};
		jQuery.ajax(params);
	});

	$(document).on("click",".buy-now", function(){
		var quantity = 1;
		var variant_id = $(this).attr('data-variantid');
		var params = {
			type: 'POST',
			url: '/cart/add.js',
			data: 'quantity=' + quantity + '&id=' + variant_id,
			dataType: 'json',
			success: function(line_item) {
				if ((typeof callback) === 'function') {
					callback(line_item);
				} else {
					$('#view-cart > div:not(#clone-item,.text-mini-cart,.cart-check-mini)').remove();
					getCartView();
					getCartAjax();
					$('#myCart').modal('show');
					$('.modal-backdrop').css({'height':$(document).height(),'z-index':'99'});
				}
			},
			error: function(XMLHttpRequest, textStatus) {
				Haravan.onError(XMLHttpRequest, textStatus);
			}
		};
		jQuery.ajax(params);
	});

	$(function() {
		$('nav#menu-mobile').mmenu(); 
	});
	flagg = true;
	if(flagg){
		$('a.navbar-toggle').click(function(){
			$('#menu-mobile').removeClass('hidden');
			flagg = false;
		})
	}
	jQuery(window).scroll(function() {
		if ($(this).scrollTop() > 100) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	});
	jQuery('.scrollToTop').click(function() {
		$('html, body').animate({
			scrollTop: 0
		}, 600);
		return false;
	});
	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	})

	var callBack = function (variant, selector) {
		if (variant) {
			modal = $('#quick-view-modal');
			$('.p-price').html(Haravan.formatMoney(variant.price, ""));
			if (variant.compare_at_price > 0)
				modal.find('del').html(Haravan.formatMoney(variant.compare_at_price, ""));
			else
				modal.find('del').html('');
			if (variant.available) {
				modal.find('.btn-addcart').css('display', 'block');
				modal.find('.btn-soldout').css('display', 'none');
			}
			else {
				modal.find('.btn-addcart').css('display', 'none');
				modal.find('.btn-soldout').css('display', 'block');
			}
		}
		else {
			modal.find('.btn-addcart').css('display', 'none');
			modal.find('.btn-soldout').css('display', 'block');
		}
	}
	var p_select_data = $('.p-option-wrapper').html();
	var p_zoom = $('.image-zoom').html();
	var quickViewProduct = function (purl) {

		if ($(window).width() < 680) { window.location = purl; return false; }
		modal = $('#quick-view-modal'); modal.modal('show');
		$.ajax({
			url: purl + '.js',
			async: false,
			success: function (product) {
				$.each(product.options, function (i, v) {
					product.options[i] = v.name;
				})
				modal.find('.p-title').html(product.title);
				modal.find('.p-option-wrapper').html(p_select_data);
				$('.image-zoom').html(p_zoom);
				modal.find('.p-url').attr('href', product.url);

				$.each(product.variants, function (i, v) {
					modal.find('select#p-select').append("<option value='" + v.id + "'>" + v.title + ' - ' + v.price + "</option>");
				})
				if (product.variants.length == 1 && product.variants[0].title.indexOf('Default') != -1)
					$('.p-option-wrapper').hide();
				else
					$('.p-option-wrapper').show();
				if (product.variants.length == 1 && product.variants[0].title.indexOf('Default') != -1) {
					callBack(product.variants[0], null);
				}
				else {
					new Haravan.OptionSelectors("p-select", { product: product, onVariantSelected: callBack });
					if (product.options.length == 1 && product.options[0].indexOf('Tiêu đề')==-1)
						modal.find('.selector-wrapper:eq(0)').prepend('<label>' + product.options[0] + '</label>');
					$('.p-option-wrapper select:not(#p-select)').each(function () {
						$(this).wrap('<span class="custom-dropdown custom-dropdown--white"></span>');
						$(this).addClass("custom-dropdown__select custom-dropdown__select--white");
					});
					callBack(product.variants[0], null);
				}
				if (product.images.length == 0) {
					modal.find('.p-product-image-feature').attr('src', '//hstatic.net/0/0/global/noDefaultImage6_large.gif');
				}
				else {		
					$('#p-sliderproduct').remove();
					$('.image-zoom').append("<div id='p-sliderproduct'>");
					$('#p-sliderproduct').append("<ul class='owl-carousel'>");
					$.each(product.images, function (i, v) {
						elem = $('<li class="item">').append('<a href="#" data-image="" data-zoom-image=""><img /></a>');
						elem.find('a').attr('data-image', Haravan.resizeImage(v, 'medium'));
						elem.find('a').attr('data-zoom-image', v);
						elem.find('img').attr('data-image', Haravan.resizeImage(v, 'medium'));
						elem.find('img').attr('data-zoom-image',v);
						elem.find('img').attr('src', Haravan.resizeImage(v, 'small'));
						modal.find('.owl-carousel').append(elem);
					});
					var owl = $('.owl-carousel');
					owl.owlCarousel({
						items:3,
						navigation : true,
						navigationText :['owl-prev', 'owl-next']
					});
					$('#p-sliderproduct .owl-carousel .owl-item').first().children('.item').addClass('active');
					modal.find('.p-product-image-feature').attr('src', product.featured_image);
					$(".modal-footer .btn-readmore").attr('href', purl);
				}

			}
		});

		//$('.modal-backdrop').css('opacity', '0');
		return false;
	}
	$('#quick-view-modal').on('click', '.item img', function (event) {
		event.preventDefault();
		modal = $('#quick-view-modal');
		modal.find('.p-product-image-feature').attr('src', $(this).attr('data-zoom-image'));
		modal.find('.item').removeClass('active');
		$(this).parents('li').addClass('active');
		return false;
	});

	$(document).on("click",".mask", function(event){
		event.preventDefault();
		quickViewProduct($(this).attr('data-handle'));
	});
	jQuery(document).on("click",".remove-cart",function(){
		var index_view_cart = jQuery(this).parents('.item-cart').index() - 1;
		jQuery(this).parents('.item-cart').remove();
		var variant_id = jQuery(this).attr('data-id');
		var params = {
			type: 'POST',
			url: '/cart/change.js',
			data:  'quantity=0&id='+variant_id,
			dataType: 'json',
			success: function(cart) { 	
				if ( cart.item_count > 0 ) {
					jQuery('.ajax_cart_quantity').html(cart.item_count);
					jQuery('.ajax-price-head').html(Haravan.formatMoney(cart.total_price, ""));
					if ( window.location.pathname == '/cart' ){
						jQuery('#total-carts').html(Haravan.formatMoney(cart.total_price, ""));
						jQuery('#cartformpage tr.list-carts').eq(index_view_cart).remove();
					};
					jQuery('.cart_block_total').html(Haravan.formatMoney(cart.total_price, ""));
				} else {
					if ( window.location.pathname == '/cart' ){
						jQuery('#cartformpage').remove();
						jQuery('#layout-page').append("<p class='text-center'>Không có sản phẩm nào trong giỏ hàng!</p><p class='text-center'><a href='/collections/all'><i class='fa fa-reply'></i> Tiếp tục mua hàng</a></p>");
					}
					jQuery('.ajax_cart_quantity').html(cart.item_count);
					jQuery('.ajax-price-head').html(Haravan.formatMoney(cart.total_price, ""));
					jQuery('#view-cart > div:not(#clone-item)').remove();
					jQuery('#view-cart').append("<div style='padding:40px 20px;'> <p style='margin:0' class='text-center'>Giỏ hàng của bạn đang trống</p><p class='text-center'><a href=''>Tiếp tục mua hàng</a></p></div>");
				}
			},
			error: function(XMLHttpRequest, textStatus) {
				Haravan.onError(XMLHttpRequest, textStatus);
			}
		};
		jQuery.ajax(params);
	});
});