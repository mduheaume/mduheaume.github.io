var _ = require("underscore");
var Backbone = require("backbone");


var SelectionsManager = Backbone.Collection.extend({
    initialize: function(options) {
        this.on("change:selected", this.handle_selection_change, this);
    },
    handle_selection_change: function(selection) {
        if (selection.get("selected")) {
            //deselect everything else in the same category
            _.each(this.where({selected: true, category: selection.get("category")}), function(item) {
                if (item!=selection) {
                    item.set("selected", false, {silent: true});
                }
            });
        }
    }
})

var SelectionsMenu = Backbone.View.extend({
    initialize: function(options) {
        this.collection.on("change:selected", this.render, this);
        this.collection.on("add", this.render, this);
    },
    events: {
        "click .menuitem": "click_menuitem"
    },
    render: function() {
        var mainlist = $("<ul></ul>");
        var categories = _.uniq(this.collection.pluck("category"));
        _.each(categories, function(category) {
            var mainitem = $("<li>"+category+"</li>");
            var sublist = $("<ul></ul>");
            _.each(this.collection.where({'category': category}), function(selection) {
                var li = $("<li class='menuitem' data-cid='"+selection.cid+"'>"+selection.get("title")+"</li>");
                if (selection.get("selected")) {
                    li.addClass("selected");
                }
                sublist.append(li);
            }, this);
            mainitem.append(sublist);
            mainlist.append(mainitem);
        }, this);
        this.$el.html(mainlist);
    },

    click_menuitem: function(evt) {
        var cid = $(evt.currentTarget).data("cid");
        var selection = this.collection.getByCid(cid);
        selection.set("selected", true);
    }
});

var LayerComposition = Backbone.View.extend({
    initialize: function(options) {
        this.collection.on("change:selected", this.render, this);
        this.collection.on("add", this.render, this);
    },
    render: function() {
        console.log("render");
        this.$(".expired").remove();
        var canvas = $("<div></div>");
        canvas.addClass("fade");        
        canvas.css("opacity", 0);
        _.each(this.collection.where({selected: true}), function(selection) {
            var layer_div = $("<div></div>");
            layer_div.css({
                'top': '0px',
                'left': '0px',
                'position': 'absolute',
                'background-image': 'url('+selection.get("url")+')',
                'width': '800px',
                'height': '600px'
            });
            canvas.append(layer_div);

        });
        this.$(".fade").addClass("expired");
        this.$el.append(canvas);
        setTimeout(function() {
            canvas.css("opacity", 1);
        }, 10);

    }
});

var DesignCenter = Backbone.Router.extend({
    initialize: function() {
        this.selections = new SelectionsManager();
        this.main_view = new LayerComposition({
            collection: this.selections
        });
        this.menu_view = new SelectionsMenu({
            collection: this.selections
        });
        this.main_view.render();
        this.menu_view.render();

    },
    add_selection: function(selection) {
        this.selections.add(selection);

    },
    remove_selection: function(selection) {
        this.selections.remove(selection);
    }
});





