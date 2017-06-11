/**
 ┌──────────────────────────────────────────────────────────────┐
 │               ___ ___ ___ ___ ___ _  _ ___ ___               │
 │              |_ _/ _ \_ _/ _ \_ _| \| | __/ _ \              │
 │               | | (_) | | (_) | || .` | _| (_) |             │
 │              |___\___/___\___/___|_|\_|_| \___/              │
 │                                                              │
 │                                                              │
 │                       set up in 2015.2                       │
 │                                                              │
 │   committed to the intelligent transformation of the world   │
 │                                                              │
 └──────────────────────────────────────────────────────────────┘
*/
 
var _ = require('lodash');
var uu_request = require('../utils/uu_request');
var moment = require('moment');
var eventproxy = require('eventproxy');

var moduel_prefix = 'drp_warehouse_logistics';

exports.register = function(server, options, next) {
    var service_info = "drp warehouse";
    
    server.route([
        //查询等待发货的运单
        {
            method: 'GET',
            path: '/list_commit_order',
            handler: function(request, reply) {
                //查询物流接口
                var url = "http://211.149.248.241:18013/order/list_commit_order";
                url = url + "?org_code=ioio";
                
                uu_request.do_get_method(url,function(err,content) {
                    if (err) {
                        return reply({"success":true,"message":"ok"});
                    } else {
                        var logistics_orders = content.rows;
                        
                        if (logistics_orders.length == 0) {
                            return reply({"success":true,"message":"ok"});
                        }
                        
                        var order_ids = [];
                        _.each(logistics_orders,function(logistics_order) {
                            order_ids.push(logistics_order.order_id);
                        });
                        
                        //查询订单
                        var order_url = "http://211.149.248.241:18010/search_orders_infos";
                        order_url = order_url + "?order_ids=" + JSON.stringify(order_ids);
                        
                        uu_request.do_get_method(order_url,function(err,content) {
                            var ec_orders = content.rows;
                            var products = content.products;
                            
                            var m_ec_order = {};
                            _.each(ec_orders,function(ec_order) {
                                m_ec_order[ec_order.order_id] = ec_order;
                            });
                            
                            var rows = [];
                            _.each(logistics_orders,function(logistics_order) {
                                var row = _.merge(logistics_order,m_ec_order[logistics_order.order_id]);
                                row.product_count = m_ec_order[logistics_order.order_id].details.length;
                                row.address = row.to_province+row.to_city+row.to_district;
                                
                                //补充产品信息
                                _.each(row.details,function(detail) {
                                    if (products[detail.product_id]) {
                                        detail.product_name=products[detail.product_id].product_name;
                                    }
                                });
                                
                                rows.push(row);
                            });
                            
                            return reply({"success":true,"message":"ok","rows":rows});
                        });
                    }
                });
            },
        },
        
        //查询打印设置
        {
            method: 'GET',
            path: '/get_print_setting',
            handler: function(request, reply) {
                var person_id = "1";
                var print_type = request.query.print_type;
                if (!print_type) {
                    return reply({"success":false,"message":"param print_type is null","service_info":service_info});
                }
                
                var url = "http://211.149.248.241:16003/get_print_setting_by_person";
                url = url + "?person_id="+person_id+"&print_type="+print_type;
                
                uu_request.do_get_method(url,function(err,content) {
                    return reply({"success":true,"message":"ok","row":content.row});
                });
            }
        },
        
        //保存打印设置
        {
            method: 'POST',
            path: '/save_print_setting',
            handler: function(request, reply) {
                var person_id = "1";
                var print_type = request.payload.print_type;
                if (!print_type) {
                    return reply({"success":false,"message":"param print_type is null","service_info":service_info});
                }
                var settings = request.payload.settings;
                if (!settings) {
                    return reply({"success":false,"message":"param settings is null","service_info":service_info});
                }
                
                var url = "http://211.149.248.241:16003/save_print_setting";
                var data = {"person_id":person_id,"print_type":print_type,"settings":settings};
                
                uu_request.do_post_method(url,data,function(err,content) {
                    return reply({"success":true,"message":"ok"});
                });
            }
        },
        
        //批量设置物流单号
        {
            method: 'POST',
            path: '/batch_set_logi_no',
            handler: function(request, reply) {
                //物流公司
                var logi_name = request.payload.logi_name;
                if (!logi_name) {
                    return reply({"success":false,"message":"param logi_name is null","service_info":service_info});
                }
                var begin_no = request.payload.begin_no;
                if (!begin_no) {
                    return reply({"success":false,"message":"param begin_no is null","service_info":service_info});
                }
                //订单号列表
                var order_ids = request.payload.order_ids;
                if (!order_ids) {
                    return reply({"success":false,"message":"param order_ids is null","service_info":service_info});
                }
                
                var url = "http://211.149.248.241:18013/order/batch_set_logi_no";
                var data = {"logi_name":logi_name,"begin_no":begin_no,"order_ids":order_ids};
                
                uu_request.do_post_method(url,data,function(err,content) {
                    return reply({"success":true,"message":"ok"});
                });
            }
        },
        
    ]);

    next();
}

exports.register.attributes = {
    name: moduel_prefix
};