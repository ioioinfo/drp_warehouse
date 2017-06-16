var React = require('react');
var ReactDOM = require('react-dom');

var Logo = require('Logo');
var WrapRightHead = require('WrapRightHead');
var WrapBottom = require('WrapBottom');



// 框架
class Wrap extends React.Component {
    constructor(props) {
        super(props);
        // 初始化一个空对象
        this.state = {thitems:[],tritems:[],indexs:[]};
    }
    componentDidMount(){

        var th = [{sort:"order_id",th:"订单号"}
                 ,{sort:"address",th:"地址"}
                 ,{sort:"linkname",th:"订单人"}
                 ,{sort:"mobile",th:"手机"}
                 ,{sort:"product_count",th:"数量"}
                 ,{sort:"logi_name",th:"快递"}
                 ,{sort:"operation",th:"操作",type:"operation"}];

                 this.setState({thitems:th});
                 $.ajax({
                     url: "/list_commit_order",
                     dataType: 'json',
                     type: 'GET',
                     success: function(data) {
                         if(data.rows){
                             this.setState({tritems:data.rows});
                             var indexs = [];
                             var index = 0;
                             for (var i = 0; i <data.rows.length; i++) {
                                 orders_map[data.rows[i].id]=data.rows[i];
                             }

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
                        <Left thitems={this.state.thitems} tritems={this.state.tritems} indexs={this.state.indexs}/>
                    </div>
                </div>

                <Back/>
            </div>
        );
    }
};
// 右侧下部表格
class Left extends React.Component {

    render() {
        return (
            <div className="wrapLeft col-sm-12">
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
                        {this.props.tritems.map(item=> (
                            <Tr key={item.id} item={item} thitems = {this.props.thitems} />))
                        }
                        </tbody>
                    </table>
                </div>
                <Alert tritems={this.props.tritems} indexs={this.props.indexs}/>
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
                <Td key={item.sort} scope="row" item={this.props.item} thitem={item} />))
            }
            </tr>
        );
    }
};
class Td extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick=this.handleClick.bind(this);
    }
    handleClick(e){
        event.stopPropagation();
        var tarid = e.target.id;
        var dataid = $("#"+tarid).data("id");
        var linkname = orders_map[dataid].linkname;
        var mobile = orders_map[dataid].mobile;
        var address = orders_map[dataid].to_province+orders_map[dataid].to_city+orders_map[dataid].to_district+orders_map[dataid].detail_address;
        $(".linkname").val(linkname);
        $(".mobile").val(mobile);
        $(".detail_address").val(address);
        $(".alert_one").show();
        $(".modal-backdrop").show();
    }
    render() {
        var style = {"textAlign":"center"};
        if(this.props.thitem.type=="operation"){
            return (
                <td style={style}><button onClick={this.handleClick} id={this.props.item.id} data-id={this.props.item.id}  className="last_td">编辑</button></td>
            );
        }else{
            return (
                <td>{this.props.item[this.props.thitem.sort]}</td>
            );
        }

    }
};

class Alert extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick=this.handleClick.bind(this);
    }
    handleClick(e){
        $(".alert_one").hide();
        $(".modal-backdrop").hide();
    }
    render() {
        var style = {"left":"34%"};
        return (
            <div className="alert alert_one" style={style}>
                <div className="modal-dialog modal-sm" role="document">
                    <div className="modal-content modal_content_padding">
                    <p className="alert_line_two"><span className="alert_title">快递单号 :</span><span className="courier_input"><input className="print_number logistics_order" type="text" /></span></p>
                    <p className="alert_line_two"><span className="alert_title">姓名 :</span><span className="courier_input"><input className="print_number linkname" type="text"/></span></p>
                    <p className="alert_line_two"><span className="alert_title vertical_align_top">地址 :</span><span className="courier_input"><textarea className="print_number detail_address textarea_style_alert" type="text"></textarea></span></p>
                    <p className="alert_line_two"><span className="alert_title">手机 :</span><span className="courier_input"><input className="print_number mobile" type="text" /></span></p>

                    <hr/>
                    <p className="text_align_center"><button  className="button button-glow button-rounded button-raised button-primary print" onClick={this.handleClick}>保 存</button></p>
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
        $(".alert_one").hide();
        $(".modal-backdrop").hide();
    }
    render() {
        return (
            <div className="modal-backdrop fade in" onClick={this.handleClick}></div>
        );
    }
};

// 返回到页面
ReactDOM.render(
    <Wrap/>,
    document.getElementById("content")
);
