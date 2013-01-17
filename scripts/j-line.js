// j-line
// 站点插件
//
// by mwc @2012/6
//
// 基本使用方法：
//
// $("selector").jLine( options, [data] );
//
// options => {
//      showContent: true,  // 显示附加文本 (boolean)
//      contentPos: "bottom",   // 文本位置 (string)
//      color: "gray",   // [点]的颜色 (string)
//      connectLine: "gray", // 连接线的颜色 (string)
//      dotClick: $.noop    // 点击指定的 [点] 产生的回调事件
// }
//
// [颜色支持]
// ---------------------------
// white    白
// gray     灰
// green    绿
// red      红
// blue     蓝
// purple   紫
// cyan     青
// yellow   黄
// orange   橙
//
// data => [ "[点]标题文本1=>超链接地址", "[点]标题文本2", ... ]
//
// [客户端示例]
// 示例1： 将 .lines 中的元素显示为红色的点
// $(".lines").jLine( { color: "red" } );
//
// 示例2： 以默认灰色的点显示指定数据为[点]到 div#lines 中，第二个标题文本 bbb 是超链接
// <div id="point"></div>
// $("#point").jLine( [ "aaa", "bbb=>http://www.baidu.com", "ccc" ] );
//
// [注意]
// * 提供数据形式的 jQuery 对象仅能是 div、dl、ul(建议)、ol；
// * 提供数据形式或者直接给出 HTML 形式两者仅能二选其一，不能同时兼顾使用。



; ( function ( $ )
{
    $.fn.jLine = function ( option, data )
    {
        var setting = {},
            SUPPORT_ELEMENT = { "div": "div", "dl": "dd", "ul": "li", "ol": "li" },
            SUPPORT_COLOR = "j-white j-gray j-green j-red j-blue j-purple j-cyan j-yellow j-orange",
            INFO = "仅支持 div, dl, ul, ol 元素",
            ELEMENT_FORMAT_GENERAL = '<{0}></{0}>',   // 常规元素格式
            ELEMENT_FORMAT_LINK = '<{0}><a href="{2}" target="{3}">{1}</a></{0}>',  // 超链接格式
            ELEMENT_FORMAT_SPAN = '<{0}><span>{1}</span></{0}>';    // 普通文本格式
        ELEMENT_FORMAT_CONN = '<{0} class="j-conn{1}"{2}></{0}>';  // 连接线格式

        if ( $.isArray( option ) )
        {
            data = option;
            option = {};
        }

        $.extend( setting, {
            showContent: true,  // 显示附加文本 (boolean)
            // 文本位置 (string):
            //     top: 文字在[点]上方
            //     bottom: 文字在[点]下方
            //     alternately: 上下交替
            //     默认: bottom
            contentPos: "bottom",

            color: "gray",   // [点]的颜色 (string)
            connectLineColor: "gray", // 连接线的颜色 (string)
            connectLineWidth: "30px",   // 连接线长度 (string/number)

            stressEnds: true,    // 两端的 [点] 更突出（点稍微大一点点）

            // 点击指定的 [点] 产生的回调事件，发送参数： function( event, dotIndex, dotObject )
            //      event: 事件对象
            //      dotIndex: 点击的点的索引
            //      dotObject: [点] 对象
            dotClick: $.noop
        }, option || {} );

        var pFunc = {
            "byIndex": fillColorByIndex,
            "forward": fillColorForward,
            "afterward": fillColorAfterward
        };

        var pContentFunc = {
            "top": { top: "-20px", func: function ( i ) { return this.top; } },
            "bottom": { top: "20px", func: function ( i ) { return this.top; } },
            "alternately": { up: "-20px", down: "20px", func: function ( i ) { return ( i % 2 == 0 ) ? this.up : this.down; } }
        };

        // 返回指定索引的 [点]
        this.getStation = function ( stationIndex )
        {
            return this.children( ".j-station" ).eq( stationIndex );
        }

        // 从 index 开始往前修改所有的点和连接线的颜色
        function fillColorForward( index, color )
        {
            var me = this.getStation( index );
            fillColor( this.children( ":lt(" + ( index * 2 + 1 ) + ")" ), color );
        }

        // 修改 index 点的颜色
        function fillColorByIndex( index, color )
        {
            fillColor( this.children( ".j-station:eq(" + index + ")" ), color );
        }

        function fillColor( obj, color )
        {
            obj.addClass( "j-" + color );
        }

        // 从 index 开始往后修改所有的点和连接线的颜色
        function fillColorAfterward( index, color )
        {
            fillColor( this.children( ":gt(" + ( index * 2 - 1 ) + ")" ), color );
        }

        // 定位标题文本位置
        function innerShowContent( i, f )
        {
            var f = pContentFunc[setting.contentPos.toLowerCase()];

            this.children().addClass( "j-text-title" ).css( {
                top: f.func( i ),
                width: ( this.width() + parseInt( setting.connectLineWidth ) ),
                left: ( -1 * parseInt( setting.connectLineWidth ) / 2 )
            } );
        }

        // 修改指定索引的 [点] 的颜色
        // fillStrategy (string):
        //      byIndex - 仅当前索引的点（默认）
        //      forward - 包括前面所有点及连接线
        //      afterward - 包括后面所有点及连接线
        this.changeColor = function ( stationIndex, color, fillStrategy )
        {
            fillStrategy = fillStrategy || "byIndex";
            stationIndex = stationIndex < 0 ? 0 : stationIndex;

            if ( fillStrategy in pFunc )
            {
                this.children().removeClass( SUPPORT_COLOR );
                pFunc[fillStrategy].apply( this, [stationIndex, color] );
            }

            return this;
        }

        // 闪烁指定的点
        // duration: 闪烁时间长度（单位：毫秒），为空或者设置为 0 则一直闪烁。
        this.flash = function ( stationIndex, duration )
        {
            duration = ( duration || 0 );
            stationIndex = ( stationIndex < 0 ? 0 : stationIndex );

            var s = this.children( ".j-station:eq(" + stationIndex + ")" );

            s.addClass( "j-flash" );

            if ( duration !== 0 )
            {
                setTimeout( function () { s.removeClass( "j-flash" ); }, duration );
            }

            return this;
        }

        // 使指定的点停止闪烁
        this.stopFlash = function ( stationIndex )
        {
            this.children( ".j-station:eq(" + ( stationIndex < 0 ? 0 : stationIndex ) + ")" ).removeClass( "j-flash" );
        }

        // 创建 [点] 信息
        var buildStation = function ( data )
        {
            if ( data && $.isArray( data ) && data.length > 0 )
            {
                this.empty();
                var nodeName = this.get( 0 ).tagName.toLowerCase();

                if ( nodeName in SUPPORT_ELEMENT )
                {
                    var childrenName = SUPPORT_ELEMENT[nodeName];

                    for ( var i in data )
                    {
                        var format;

                        if ( setting.showContent )
                        {
                            var url = "",
                            target = "_self",
                            content = data[i],
                            linkMatch = content.match( /^(.+?)(=>)(.*?)(\[(\_.+?)\])*$/ );

                            if ( linkMatch && linkMatch.length > 0 )
                            {
                                format = ELEMENT_FORMAT_LINK;
                                content = linkMatch[1];
                                url = $.trim( linkMatch[3] );
                                url = url ? url : "javascript: void(0)";
                                if ( linkMatch.length > 4 )
                                {
                                    target = linkMatch[5];
                                }
                            }
                            else
                            {
                                format = ELEMENT_FORMAT_SPAN;
                            }
                        }
                        else
                        {
                            format = ELEMENT_FORMAT_GENERAL;
                        }

                        this.append(
                            format.replace( /\{0\}/g, childrenName )
                                  .replace( /\{1\}/g, content )
                                  .replace( /\{2\}/g, url )
                                  .replace( /\{3\}/g, target )
                        );
                    }

                    return childrenName;
                } else
                {
                    alert( INFO );
                }
            }

            return null;
        }

        // 创建 [点] 连接线
        function buildStationConnectionLine( tag, stations )
        {
            if ( tag )
            {
                stations.filter( ":not(:last)" ).after(
                    ELEMENT_FORMAT_CONN.replace( /\{0\}/g, tag )
                                       .replace( /\{1\}/g, ( setting.connectLineColor ? ( " j-" + setting.connectLineColor ) : "j-gray" ) )
                                       .replace( /\{2\}/g, ( setting.connectLineWidth ? ( ' style="width: ' + setting.connectLineWidth + ';"' ) : '' ) )
                );
            }
        }

        // 定位连接线及标题文本
        function setPositions( line )
        {
            var allChild = line.children();
            var len = allChild.length;

            if ( len > 0 )
            {
                var curPosition = 0;
                for ( var i = 0; i < len; i++ )
                {
                    var e = allChild.eq( i );

                    e.css( "left", curPosition );
                    curPosition += e.width();

                    if ( setting.showContent && e.hasClass( "j-station" ) )
                        innerShowContent.apply( e, [i / 2] );
                }
            }
        }

        return this.each( function ( i, e )
        {
            var line = $( this );

            var tag = buildStation.apply( line, [data] );

            var stations = line.children();

            line.addClass( "j-line" );

            stations.addClass( "j-line-children j-station" + ( setting.color ? ( " j-" + setting.color ) : "j-gray" ) ).click( function ( event )
            {
                var me = $( this );
                setting.dotClick( event, me.index( ".j-station" ), me );    // 引发单击事件
            } );

            if ( setting.stressEnds )   // 突出两端
                stations.first().add( stations.last() ).addClass( "j-ends" );

            buildStationConnectionLine.apply( line, [tag, stations] );  // 创建连接线

            setPositions( line );   // 定位
        } );
    }
} )( jQuery );