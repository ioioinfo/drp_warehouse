var React = require('react');
var ReactDOM = require('react-dom');

var Logo = require('Logo');
var WrapRightHead = require('WrapRightHead');
var WrapBottom = require('WrapBottom');


// 跳转打印页面
var print_method = function(docStr){
    var newWindow=window.open("打印窗口","_blank");//打印窗口要换成页面的url
    newWindow.document.write("<style>body{margin:0;}</style>");
    newWindow.document.write(docStr);
    newWindow.document.write("<script>window.onload=window.print();</script>");
    $(".courier_wrap_print").attr("style","display:none;");
    $(".alert").attr("style","display:none;");
    $(".modal-backdrop").attr("style","display:none;");
    //newWindow.print();
    //newWindow.close();
};
// 过滤快递公司
var filter_courier = function(items,courier) {
    var rows = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.logi_name == courier) {
            rows.push(item);

        }
    }

    return {"items":rows,"courier":courier,"number":rows.length};
};

// 框架
class Wrap extends React.Component {
    constructor(props) {
        super(props);
        // 初始化一个空对象
        this.state = {thitems:[],tritems:[]};
    }
    componentDidMount(){
        var th = [{sort:"order_id",th:"订单号"}
                 ,{sort:"address",th:"地址"}
                 ,{sort:"linkname",th:"订单人"}
                 ,{sort:"mobile",th:"手机"}
                 ,{sort:"product_count",th:"数量"}
                 ,{sort:"logi_name",th:"快递"}];

                 this.setState({thitems:th});
                 $.ajax({
                     url: "/list_commit_order",
                     dataType: 'json',
                     type: 'GET',
                     success: function(data) {
                         if(data.rows){
                             this.setState({tritems:data.rows});
                         }
                     }.bind(this),
                     error: function(xhr, status, err) {
                     }.bind(this)
                 });

    }
    render() {
        return (
            <div className="wrap">
            <nav className="navbar navbar-inverse navbar-fixed-top">
            <div className="container-fluid">
            <Logo />
            <WrapRightHead />
            </div>
            </nav>
            <div className="container-fluid margin_top88">
            <div className="row">
            <Left thitems={this.state.thitems} tritems={this.state.tritems}  />
            <Right tritems={this.state.tritems} />
            </div>
            </div>
            <JianList tritems={this.state.tritems}/>
            <Back/>
            </div>
        );
    }
};
// 右侧下部表格
class Left extends React.Component {

    render() {
        return (
            <div className="wrapLeft col-sm-8">
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead>
                        <tr>
                        {this.props.thitems.map(item => (
                            <Th key={item.sort} item = {item}/>))
                        }
                        </tr>
                        </thead>
                        <tbody>
                        {this.props.tritems.map(item => (
                            <Tr key={item.id} item={item} thitems = {this.props.thitems}/>))
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
};
// 右侧下部表格th
class Th extends React.Component {
    render() {
        return (

            <th scope="row">{this.props.item.th}</th>

        );
    }
};
// 右侧下部表格tr
class Tr extends React.Component {
    render() {
        return (
            <tr>
            {this.props.thitems.map(item => (
                <td key={item.sort} scope="row" >{this.props.item[item.sort]}</td>))
            }
            </tr>
        );
    }
};
// 右侧操作
class Right extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick=this.handleClick.bind(this);
        this.handleClick1=this.handleClick1.bind(this);
        this.handleClick2=this.handleClick2.bind(this);
        this.state={"items":[],"courier":"","number":0};
    }
    handleClick(id){
        var items = this.props.tritems;


        $(".alert_line_two").attr("style","display:block");
        // 点击打印按钮调用filter_courier（）方法筛选快递返回来items(item:rows),
        if(id==1){
            this.setState(filter_courier(items,"中通"));//react根据条件更改内容要用setstate刷新
        }else if (id==2) {
            this.setState(filter_courier(items,"申通"));
        }else if(id==3){
            this.setState(filter_courier(items,"顺丰到付"));
        }else if(id==4){
            this.setState({courier:"捡货单",number:this.props.tritems.length});//获取快递单总条数，放进setstate里刷新数据
            $(".alert_line_two").attr("style","display:none");
        }else {
            alert("参数错误");
        }
        $(".alert_one").show();
        $(".modal-backdrop").show();
    }
    //打印
    handleClick1(e){
        // print_method();
        var items = this.state.items;
        var jianitems = this.props.tritems;
        console.log(items);
        if (jianitems.length==0) {
            alert("暂无订单");
            return;
        }

        if(this.state.courier=="捡货单"){
            print_method($(".jianlist_wrap").html());
        }else {
            //循环订单单号传给后台
            var order_ids = [];
            var begin_no = $(".print_number").val();
            if (!begin_no) {
                alert("请输入快递单号");
                return;
            }
            var logi_name = this.state.courier;
            for (var i = 0; i < items.length; i++) {
                order_ids.push(items[i].order_id);
            }
            print_method($(".courier_wrap_print").html());
            $.ajax({
                url: "/batch_set_logi_no",
                dataType: 'json',
                type: 'POST',
                data: {"logi_name":logi_name,"begin_no":begin_no,"order_ids":JSON.stringify(order_ids)},
                success: function(data) {
                    if (data.success) {
                        alert("保存成功！");
                    }else {
                        alert("保存失败！");
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                }.bind(this)
            });
        }
    }

    handleClick2(e){
        if(!$(".seeting_height").val()){
            alert("请输入高度");
            return;
        }
        height_num = $(".seeting_height").val();

        $.ajax({
            url: "/save_print_setting",
            dataType: 'json',
            type: 'POST',
            data: {"print_type":"picking_orders","settings":JSON.stringify({"height":height_num})},
            success: function(data) {
                if (data.success) {
                    alert("保存成功！");
                }else {
                    alert("保存失败！");
                }
            }.bind(this),
            error: function(xhr, status, err) {
            }.bind(this)
        });
    }
    render() {



        return (
            <div className="wrapRight col-sm-3 col-sm-offset-1">
                <div className="news show-grid"><input type="text" className="seeting_height" /><button onClick={this.handleClick2}>保存</button></div>
                <div className="courier">
                    <div className="button_wrap show-grid"><p className="button button-block button-rounded button-primary button-large" onClick={this.handleClick.bind(this,4)}><img src="images/dayin.png" alt=""/>订单</p></div>
                    <div className="button_wrap">
                        <p className="button button-block button-rounded button-highlight button-large show-grid" onClick={this.handleClick.bind(this,1)}><img src="images/zhongtong.png" alt=""/>中通</p>
                        <p className="button button-block button-rounded button-caution button-large show-grid" onClick={this.handleClick.bind(this,2)}><img src="images/shentong.png" alt=""/>申通</p>
                        <p className="button button-block button-rounded button-royal button-large" onClick={this.handleClick.bind(this,3)}><img src="images/shunfeng.png" alt=""/>顺风</p>
                    </div>
                </div>
                <div className="alert alert_one">
                    <div className="modal-dialog modal-sm" role="document">
                        <div className="modal-content modal_content_padding">
                        <p><span>{this.state.courier}</span> &nbsp;&nbsp;&nbsp;　<span>共<u>{this.state.number} 单</u></span></p>


                        <p className="alert_line_two">设置 <span className="courier_input"><input className="print_number" type="text" placeholder="初始打印单号" /></span></p>
                        <hr/>
                        <button  className="button button-glow button-rounded button-raised button-primary print" onClick={this.handleClick1}>确认打印</button>
                        </div>
                    </div>
                </div>
                <div className="courier_wrap_print">
                <div className="courier_print">
                {this.state.items.map(item => (
                    <CourierZ key={item.id} item={item} courier={this.state.courier} />))
                }
                </div>
                </div>
            </div>
        );
    }
};

// 背景
class Back extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick=this.handleClick.bind(this);
    }
    handleClick(e){
        $(".alert_three").hide();
        $(".alert_two").hide();
        $(".alert_one").hide();
        $(".modal-backdrop").hide();
    }
    render() {
        return (
            <div className="modal-backdrop fade in" onClick={this.handleClick}></div>
        );
    }
};

// 快递模版
class CourierZ extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var courier = this.props.item.logi_name;
        var style1 = "",style2 = "",style3 = "",style4 = "",style5 = "",style6 = "",style7 = "",style8 = "";
        var address = "";
        var courier_name = "";
        if(courier=="中通"){
            style1={position: "relative",width:"652px",height:"363px",fontFamily:"微软雅黑"};
            style2={position: "absolute",top: "60px",left: "0px"};
            style3={position: "absolute",top: "96px",left: "7px"};
            style4={position: "absolute",top: "169px",left: "7px"};
            style5={position: "absolute",top: "60px",left: "318px"};
            style6={position: "absolute",top: "96px",left: "312px",fontSize:"12px"};
            style7={position: "absolute",top: "169px",left: "312px"};
            style8={position: "absolute",top: "280px",left: "107px"};
            address = "南通市紫琅路2号同道楼3楼";
            courier_name = "善淘网";
        }else if (courier=="申通") {
            style1={position: "relative",width:"652px",height:"363px",fontFamily:"微软雅黑"};
            style2={position: "absolute",top: "83px",left: "102px"};
            style3={position: "absolute",top: "141px",left: "96px"};
            style4={position: "absolute",top: "163px",left: "21px"};
            style5={position: "absolute",top: "69px",left: "338px"};
            style6={position: "absolute",top: "127px",left: "306px",fontSize:"12px"};
            style7={position: "absolute",top: "161px",left: "360px"};
            style8={position: "absolute",top: "298px",left: "107px"};
            address = "";
            courier_name = "";
        }else if (courier=="顺丰到付"){
            style1={position: "relative",width:"652px",height:"363px",fontFamily:"微软雅黑"};
            style2={position: "absolute",top: "94px",left: "232px"};
            style3={position: "absolute",top: "115px",left: "77px"};
            style4={position: "absolute",top: "152px",left: "137px"};
            style5={position: "absolute",top: "200px",left: "240px"};
            style6={position: "absolute",top: "218px",left: "84px",fontSize:"12px"};
            style7={position: "absolute",top: "254px",left: "137px"};
            style8={position: "absolute",top: "216px",left: "517px"};
            address = "南通市紫琅路2号同道楼3楼";
            courier_name = "善淘网";
        }
        return (
            <div className="courier_wrap">
                <div className="courier_relative" style={style1}>
                    <span className="courier_name1" style={style2}>{courier_name}</span>
                    <span className="courier_address1" style={style3}>{address}</span>
                    <span className="courier_tel1" style={style4}>18112345678</span>
                    <span className="courier_name2" style={style5}>{this.props.item.linkname}</span>
                    <span className="courier_address2" style={style6}>{this.props.item.to_province}{this.props.item.to_city}<br/>{this.props.item.detail_address}</span>
                    <span className="courier_tel2" style={style7}>{this.props.item.mobile}</span>
                    <span className="courier_name3" style={style8}></span>
                </div>
            </div>
        );
    }
};

class JianList extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        $.ajax({
            url: "/get_print_setting?print_type=picking_orders",
            dataType: 'json',
            type: 'GET',
            success: function(data) {
                if(data.row && data.row.settings){
                    height_num = data.row.settings.height;
                    if (!height_num) {
                        height_num = "650px";
                    }
                    $(".seeting_height").val(height_num);
                }
            }.bind(this),
            error: function(xhr, status, err) {
            }.bind(this)
        });
    }

    render() {
        var style = {width:"1707px"}
        return (
            <div className="jianlist_wrap">
                <div className="jianlist" style={style}>
                {this.props.tritems.map((item,index) => (
                    <JianListUl key={item.id} item={item} index={index}/>))
                }
                </div>
            </div>
        );
    }
};
class JianListUl extends React.Component {
    render() {
        var height = this.props.height;
        var style1 = {width:"100%",margin:"0",padding:"9px 0 0 0",  height:height_num,display:"flex",overflow:"hidden",fontFamily:"微软雅黑"};
        var style2 = {fontSize:"12px",textAlign:"center",width:"10%",overflow:"hidden",listStyle:"none"};

        var style5 = {fontSize:"12px",width:"20%",overflow:"hidden",listStyle:"none",textAlign:"center"};
        var style6 = {fontSize:"12px",width:"20%",overflow:"hidden",listStyle:"none"};
        var style4 = {width:"50%",overflow:"hidden",listStyle:"none",fontFamily:"微软雅黑"};
        return (
            <ul className="jianlist_ul" style={style1}>
                <li style={style2}>序号:<p>{this.props.index+1}</p></li>
                <li style={style4}>
                {this.props.item.details.map((item,index) => (
                    <JianListLi key={item.product_id} item={item} index={index} />))
                }
                </li>
                <li style={style5}>
                    联系电话:<p>{this.props.item.mobile}</p>
                </li>
                <li style={style6}>地址:<p>{this.props.item.to_province}{this.props.item.to_city}{this.props.item.detail_address}</p></li>
            </ul>
        );
    }
};
class JianListLi extends React.Component {
    render() {
        var style1 = {fontSize:"12px",float:"left",width:"30%",overflow:"hidden"};
        var style2 = {fontSize:"12px",float:"left",width:"60%",overflow:"hidden"};
        var style3 = {fontSize:"12px",float:"left",width:"10%",overflow:"hidden",textAlign:"center"};
        var style4 = {overflow:"hidden"};
        var product_id = "";
        var product_name = "";
        var number = "";
        var index = this.props.index;
        if (index==0){
            var product_id = "商品编号:";
            var product_name = "商品名称:";
            var number = "商品数量:";
        }
        return (
            <div style={style4}>
                <div style={style1}>{product_id}<p>{this.props.item.product_id}</p></div>
                <div style={style2}>{product_name}<p>{this.props.item.product_name}</p></div>
                <div style={style3}>{number}<p>{this.props.item.number}</p></div>
            </div>
        );
    }
};
// 返回到页面
ReactDOM.render(
    <Wrap/>,
    document.getElementById("content")
);
