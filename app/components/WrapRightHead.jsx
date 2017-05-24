var React = require('react');

// 右侧头部
class WrapRightHead extends React.Component {
    componentDidMount() {
    }
    render() {
        return (

            <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav navbar-right head_user_name">
            <li><a><img src="images/houtai_touxiang1.png" alt="" /></a></li>
            <li><a  data-toggle="modal" data-target=".bs-example-modal-sm">管理员1</a></li>
            </ul>
            </div>

        );
    }
};

module.exports = WrapRightHead;
