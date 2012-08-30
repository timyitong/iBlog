var __SITE__='http://106.187.92.216:3000/api'
$(function(){

	var Article = Backbone.Model.extend({
		defaults:function(){
			return{
			  title: "plz type-in a title",
			  content:"to be added",
			  ctime:""
			}
		},
		initialize: function(){
			if (!this.get("title")){
				this.set({"title": this.defualts.title})
			}
		},

		clear: function() {
			this.destroy()
		}
	})
	
	var ArticleList=Backbone.Collection.extend({
		model: Article,
		url: __SITE__+'/articles'
	})
	
	var Articles = new ArticleList

	var ArticleView = Backbone.View.extend({

		tagName: "li",
		template: _.template($('#item-template').html()),
		events: {
			"click .blog_title"		:	"contentShow"
		},
		initialize: function(){
		},
		render: function(){
		  this.$el.html(this.template(this.model.toJSON()))
			return this
		},
		contentShow: function(){
			  this.$el.parent().children().find(".blog_content").hide()
			  this.$el.children().find(".blog_content").show()
			  
		}
	})

	var AppView = Backbone.View.extend({
		el: $("#blog_app"),
		
		statsTemplate:_.template($('#stats-template').html()),
		
		events: {
		},
		
		initialize: function(){
		  Articles.bind('all',this.render,this)
		  Articles.bind('reset',this.addAll,this)
		  Articles.bind('add',this.addOne,this)
		  this.main=$('#main')

		  Articles.fetch()
		},
		
		render: function(){
			if (Articles.length){
				this.main.show()
			}else{
				this.main.hide()
			}
				
		},
			
		addOne: function(article) {
		  var view = new ArticleView({model: article});
		  this.$("#article-list").append(view.render().el);
		},

		addAll: function() {
		  Articles.each(this.addOne);
		}
	
	})
	
	var App=new AppView

})