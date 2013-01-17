// j-line
// վ����
//
// by mwc @2012/6
//
// ����ʹ�÷�����
//
// $("selector").jLine( options, [data] );
//
// options => {
//      showContent: true,  // ��ʾ�����ı� (boolean)
//      contentPos: "bottom",   // �ı�λ�� (string)
//      color: "gray",   // [��]����ɫ (string)
//      connectLine: "gray", // �����ߵ���ɫ (string)
//      dotClick: $.noop    // ���ָ���� [��] �����Ļص��¼�
// }
//
// [��ɫ֧��]
// ---------------------------
// white    ��
// gray     ��
// green    ��
// red      ��
// blue     ��
// purple   ��
// cyan     ��
// yellow   ��
// orange   ��
//
// data => [ "[��]�����ı�1=>�����ӵ�ַ", "[��]�����ı�2", ... ]
//
// [�ͻ���ʾ��]
// ʾ��1�� �� .lines �е�Ԫ����ʾΪ��ɫ�ĵ�
// $(".lines").jLine( { color: "red" } );
//
// ʾ��2�� ��Ĭ�ϻ�ɫ�ĵ���ʾָ������Ϊ[��]�� div#lines �У��ڶ��������ı� bbb �ǳ�����
// <div id="point"></div>
// $("#point").jLine( [ "aaa", "bbb=>http://www.baidu.com", "ccc" ] );
//
// [ע��]
// * �ṩ������ʽ�� jQuery ��������� div��dl��ul(����)��ol��
// * �ṩ������ʽ����ֱ�Ӹ��� HTML ��ʽ���߽��ܶ�ѡ��һ������ͬʱ���ʹ�á�



; ( function ( $ )
{
    $.fn.jLine = function ( option, data )
    {
        var setting = {},
            SUPPORT_ELEMENT = { "div": "div", "dl": "dd", "ul": "li", "ol": "li" },
            SUPPORT_COLOR = "j-white j-gray j-green j-red j-blue j-purple j-cyan j-yellow j-orange",
            INFO = "��֧�� div, dl, ul, ol Ԫ��",
            ELEMENT_FORMAT_GENERAL = '<{0}></{0}>',   // ����Ԫ�ظ�ʽ
            ELEMENT_FORMAT_LINK = '<{0}><a href="{2}" target="{3}">{1}</a></{0}>',  // �����Ӹ�ʽ
            ELEMENT_FORMAT_SPAN = '<{0}><span>{1}</span></{0}>';    // ��ͨ�ı���ʽ
        ELEMENT_FORMAT_CONN = '<{0} class="j-conn{1}"{2}></{0}>';  // �����߸�ʽ

        if ( $.isArray( option ) )
        {
            data = option;
            option = {};
        }

        $.extend( setting, {
            showContent: true,  // ��ʾ�����ı� (boolean)
            // �ı�λ�� (string):
            //     top: ������[��]�Ϸ�
            //     bottom: ������[��]�·�
            //     alternately: ���½���
            //     Ĭ��: bottom
            contentPos: "bottom",

            color: "gray",   // [��]����ɫ (string)
            connectLineColor: "gray", // �����ߵ���ɫ (string)
            connectLineWidth: "30px",   // �����߳��� (string/number)

            stressEnds: true,    // ���˵� [��] ��ͻ��������΢��һ��㣩

            // ���ָ���� [��] �����Ļص��¼������Ͳ����� function( event, dotIndex, dotObject )
            //      event: �¼�����
            //      dotIndex: ����ĵ������
            //      dotObject: [��] ����
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

        // ����ָ�������� [��]
        this.getStation = function ( stationIndex )
        {
            return this.children( ".j-station" ).eq( stationIndex );
        }

        // �� index ��ʼ��ǰ�޸����еĵ�������ߵ���ɫ
        function fillColorForward( index, color )
        {
            var me = this.getStation( index );
            fillColor( this.children( ":lt(" + ( index * 2 + 1 ) + ")" ), color );
        }

        // �޸� index �����ɫ
        function fillColorByIndex( index, color )
        {
            fillColor( this.children( ".j-station:eq(" + index + ")" ), color );
        }

        function fillColor( obj, color )
        {
            obj.addClass( "j-" + color );
        }

        // �� index ��ʼ�����޸����еĵ�������ߵ���ɫ
        function fillColorAfterward( index, color )
        {
            fillColor( this.children( ":gt(" + ( index * 2 - 1 ) + ")" ), color );
        }

        // ��λ�����ı�λ��
        function innerShowContent( i, f )
        {
            var f = pContentFunc[setting.contentPos.toLowerCase()];

            this.children().addClass( "j-text-title" ).css( {
                top: f.func( i ),
                width: ( this.width() + parseInt( setting.connectLineWidth ) ),
                left: ( -1 * parseInt( setting.connectLineWidth ) / 2 )
            } );
        }

        // �޸�ָ�������� [��] ����ɫ
        // fillStrategy (string):
        //      byIndex - ����ǰ�����ĵ㣨Ĭ�ϣ�
        //      forward - ����ǰ�����е㼰������
        //      afterward - �����������е㼰������
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

        // ��˸ָ���ĵ�
        // duration: ��˸ʱ�䳤�ȣ���λ�����룩��Ϊ�ջ�������Ϊ 0 ��һֱ��˸��
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

        // ʹָ���ĵ�ֹͣ��˸
        this.stopFlash = function ( stationIndex )
        {
            this.children( ".j-station:eq(" + ( stationIndex < 0 ? 0 : stationIndex ) + ")" ).removeClass( "j-flash" );
        }

        // ���� [��] ��Ϣ
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

        // ���� [��] ������
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

        // ��λ�����߼������ı�
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
                setting.dotClick( event, me.index( ".j-station" ), me );    // ���������¼�
            } );

            if ( setting.stressEnds )   // ͻ������
                stations.first().add( stations.last() ).addClass( "j-ends" );

            buildStationConnectionLine.apply( line, [tag, stations] );  // ����������

            setPositions( line );   // ��λ
        } );
    }
} )( jQuery );