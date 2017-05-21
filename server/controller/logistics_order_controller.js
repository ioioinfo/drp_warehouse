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
                            var m_ec_order = {};
                            _.each(ec_orders,function(ec_order) {
                                m_ec_order[ec_order.order_id] = ec_order;
                            });
                            
                            var rows = [];
                            _.each(logistics_orders,function(logistics_order) {
                                row.push(_.merge(m_ec_order[logistics_order.order_id],logistics_order));
                            });
                            
                            return reply({"success":true,"message":"ok","rows":rows});
                        });
                    }
                });
            },
        },
        
    ]);

    next();
}

exports.register.attributes = {
    name: moduel_prefix
};