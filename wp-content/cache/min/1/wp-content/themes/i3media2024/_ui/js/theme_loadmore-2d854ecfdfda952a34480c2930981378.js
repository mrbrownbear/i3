$(function(){var i3LoadMore=function(ele){this.element=$(ele);this.rpp=this.element.data('rpp');this.p=1;this.total_pages=this.element.data('total-pages');this.query=this.element.data('query');this.query.rpp=this.rpp;this.container=$(this.element.data('container'));this.binds()}
i3LoadMore.prototype.binds=function(){var self=this;this.element.on('click',function(ev){ev.preventDefault();if(self.p<self.total_pages)
self.ajax()})}
i3LoadMore.prototype.ajax=function(){self=this;self.p++;self.query.p=self.p;self.element.addClass('--disabled');$('body').addClass('--processing-request');$.ajax({cache:!0,url:WP_AJAX.ajaxurl,data:self.query}).done(function(response){html=JSON.parse(response).html;self.element.removeClass('--disabled');if(self.p==self.total_pages)
self.element.hide();var scroll=$(window).scrollTop();if(self.container){var $content=$(html);self.container.append($content).masonry('appended',$content)}
$("html, body").animate({scrollTop:scroll},1000);$('body').removeClass('--processing-request')})}
$('.i3-load-more').each(function(){new i3LoadMore($(this))})})