String.prototype.lIndexOf = function(str) {
	return this.toLowerCase().indexOf(str.toLowerCase());
}

function parseDate(date, string) {
	if (date) {
		try {
			return date.getFullYear()+'-'+numStr2(date.getMonth()+1)+'-'+numStr2(date.getDate())+' '+numStr2(date.getHours())+':'+numStr2(date.getMinutes())+':'+numStr2(date.getSeconds());
		} catch(e) {
			return '';
		}
	} else {
		return new Date(string);
	}
}

function numStr2(num) {
	if ((num+'').length == 1)
		return '0' + num;
	else
		return ''+num;
}

function FirstCharUpper(str) {
	if (!str) return str;
	return str[0].toUpperCase()+str.substring(1);
}

function cutStr(str, length) {
	if (!str) {
		return '';
	}
	if (!length) {
		length = 20;
	}
	return str.length > length ? str.substring(0, str.length-3)+'...' : str;
}

function gender(num, str) {
	if (num) {
		num = parseInt(num);
		switch(num) {
			case 1: return 'Male';
			case 2: return 'Female';
			default: return 'Unknown';
		}
	} else {
		switch(num) {
			case 'Male':
			case 'male':
				return 1;
			case 'Female':
			case 'female':
				return 2;
			default: return 0;	
		}
	}
}

function empTitle(title_num, title_string, isBig) {
	if (title_num) {
		if (isBig) {
			switch(title_num) {
				case 1: return 'Purchase Manager';
				case 2: return 'Inventory Manager';
				case 3: return 'Sales Manager';
				case 4: return 'Warehouse Keeper';
				case 5: return 'Warehouse Worker';
				case 6: return 'Shipping Clerk';
				default: return '';
			}
		}
		switch(title_num) {
			case 1: return 'Purchase manager';
			case 2: return 'Inventory manager';
			case 3: return 'Sales manager';
			case 4: return 'Warehouse keeper';
			case 5: return 'Warehouse worker';
			case 6: return 'Shipping clerk';
			default: return '';
		}
	} else if (title_string){
		switch(title_string) {
			case 'Purchase manager': return 1;
			case 'Inventory manager': return 2;
			case 'Sales manager': return 3;
			case 'Warehouse keeper': return 4; 
			case 'Warehouse worker': return 5;
			case 'Shipping clerk': return 6;
			default: return 0;
		}
	}
};

function orderStatusLabel(orderType, orderNum) {
	if (orderType == 1) {
		switch(orderNum) {
			case 0:
			case 1: return '<span class="label label-danger">'+orderStatus(orderType, orderNum)+'</span>';
			case 2:
			case 3:
			case 7: return '<span class="label label-warning" style="text-decoration: line-through; text-decoration-color: black;">'+orderStatus(orderType, orderNum)+'</span>';
			case 9: return '<span class="label label-success">'+orderStatus(orderType, orderNum)+'</span>';
			default: return '<span class="label label-info">'+orderStatus(orderType, orderNum)+'</span>';
		}
	} else if (orderType == 2) {
		switch(orderNum) {
			case 0:
			case 1: return '<span class="label label-danger">'+orderStatus(orderType, orderNum)+'</span>';
			case 2:
			case 3: return '<span class="label label-warning" style="text-decoration: line-through; text-decoration-color: black;">'+orderStatus(orderType, orderNum)+'</span>';
			case 6: return '<span class="label label-success">'+orderStatus(orderType, orderNum)+'</span>';
			default: return '<span class="label label-info">'+orderStatus(orderType, orderNum)+'</span>';
		}
	} else if (orderType == 3) {
		switch(orderNum) {
			case 0:
			case 1: return '<span class="label label-danger">'+orderStatus(orderType, orderNum)+'</span>';
			case 2:
			case 3: return '<span class="label label-warning" style="text-decoration: line-through; text-decoration-color: black;">'+orderStatus(orderType, orderNum)+'</span>';
			case 9: return '<span class="label label-success">'+orderStatus(orderType, orderNum)+'</span>';
			default: return '<span class="label label-info">'+orderStatus(orderType, orderNum)+'</span>';
		}
	}
}

function orderStatus(orderType, orderStatusNum, orderStatus) {
	if (orderType == 1) {
		if (orderStatusNum !== undefined) {
			orderStatusNum = parseInt(orderStatusNum);			
			switch(orderStatusNum) {
				case 0:  return 'Creating';
				case 1:  return 'Applying';
				case 2:  return 'Cancel';
				case 3:  return 'Deny';
				case 4:  return 'Approve';
				case 5:  return 'Transporting';
				case 6:  return 'Received';
				case 7:  return 'Return';
				case 8:  return 'Inspection Pass';
				case 9:  return 'Check-in Success';
				default: return 'Unknown';
			}
		} else {
			switch(orderStatus) {
				case 'Creating':			return 0;	
				case 'Applying':			return 1;	
				case 'Cancel':				return 2;
				case 'Deny':				return 3;
				case 'Approve':				return 4;	
				case 'Transporting':		return 5;		
				case 'Received':			return 6;	
				case 'Return':				return 7;
				case 'Inspection Pass':		return 8;		
				case 'Check-in Success':	return 9;
				default: 					return -1;		
			}
		}
	} else if (orderType == 2) {
		if (orderStatusNum !== undefined) {
			orderStatusNum = parseInt(orderStatusNum);
			switch(orderStatusNum) {
				case 0:  return 'Creating';
				case 1:  return 'Applying';
				case 2:  return 'Cancel';
				case 3:  return 'Deny';
				case 4:  return 'Approve';
				case 5:  return 'Picking Done';
				case 6:  return 'Checkout Success';				
				default: return 'Unknown';
			}
		} else {
			switch(orderStatus) {
				case 'Creating':			return 0;	
				case 'Applying':			return 1;	
				case 'Cancel':				return 2;
				case 'Deny':				return 3;
				case 'Approve':				return 4;	
				case 'Picking Done':		return 5;		
				case 'Checkout Success':	return 6;
				default: 					return -1;		
			}
		}
	} else if (orderType == 3) {
		if (orderStatusNum !== undefined) {
			orderStatusNum = parseInt(orderStatusNum);
			switch(orderStatusNum) {
				case 0:  return 'Creating';
				case 1:  return 'Applying';
				case 2:  return 'Cancel';
				case 3:  return 'Deny';
				case 4:  return 'Approve';
				case 5:  return 'Picking Done';
				case 6:  return 'Transporting';
				case 7:  return 'Received';
				case 8:  return 'Inspection Pass';
				case 9:  return 'Transfer Success';
				default: return 'Unknown';
			}
		} else {
			switch(orderStatus) {
				case 'Creating':			return 0;	
				case 'Applying':			return 1;	
				case 'Cancel':				return 2;
				case 'Deny':				return 3;
				case 'Approve':				return 4;
				case 'Picking Done':		return 5;		
				case 'Transporting':		return 6;		
				case 'Received':			return 7;	
				case 'Inspection Pass':		return 8;		
				case 'Transfer Success':	return 9;
				default: 					return -1;			
			}
		}
	}
}

function orderStatusColor(orderType, orderStatusNum, currentNum){
	orderStatusNum = parseInt(orderStatusNum);
	currentNum = parseInt(currentNum);
	if (orderStatusNum == currentNum)
		return 'none';

	if (orderType == 1) {
		if (orderStatusNum == 2 || orderStatusNum == 3 || orderStatusNum == 7) {
			return '#dec22e';
		} else if (orderStatusNum - currentNum == 1 || (orderStatusNum == 4 && currentNum == 1) || (orderStatusNum == 8 && currentNum == 6)) {
			return '#e86b6b';
		} else {
			return '#5897da';
		}	
	} else if (orderType == 2) {
		if (orderStatusNum == 2 || orderStatusNum == 3) {
			return '#dec22e';
		} else if (orderStatusNum - currentNum == 1 || (orderStatusNum == 4 && currentNum == 1)) {
			return '#e86b6b';
		} else {
			return '#5897da';
		}	
	} else if (orderType == 3) {
		if (orderStatusNum == 2 || orderStatusNum == 3) {
			return '#dec22e';
		} else if (orderStatusNum - currentNum == 1 || (orderStatusNum == 4 && currentNum == 1)) {
			return '#e86b6b';
		} else {
			return '#5897da';
		}	
	}
};

function getOperationStr(order_type, order_id, from_status, to_status) {
	order_id = parseInt(order_id);
	order_type = parseInt(order_type);
	from_status = parseInt(from_status);
	to_status = parseInt(to_status);
	if (to_status == 1) {
		return 'Create new order/application';
	} else if (to_status == 2) {
		return 'Cancel this order';
	} else if (to_status == 3) {
		return 'Deny this order';
	} else if (to_status == 4) {
		return 'Approve this order';
	}else {
		return 'Change order status to "'+orderStatus(order_type, to_status)+'"';
	}
}

function getOrderDisStr(order_type, order_id, whouse_id) {
	order_type = parseInt(order_type);
	order_id = parseInt(order_id);
	if (!whouse_id) {
		var str = order_type == 1 ? 'Check-in: ' : 
					(order_type == 2 ? 'Check-out: ' : 
						(order_type == 3 ? 'Transfer: ' : ''));
	} else {
		if (order_type == 3) {
			var isIn = (alasql('select * from transferorder where order_id=? and whouse_in_id=?;', [order_id, whouse_id]).length>0);
		}
		var str = order_type == 1 ? 'Check-in: ' : 
					(order_type == 2 ? 'Check-out: ' : 
						(order_type == 3 ? (isIn ? 'Transfer-In: ':'Transfer-Out: ') : ''));
	}
	str += order_type >= 1 ? order_id : '';
	return str;
}

function getPageName(order_type, order_id) {
	order_type = parseInt(order_type);
	order_id = parseInt(order_id);
	switch(order_type) {
		case 1: return 'check-in-order?id='+order_id;
		case 2: return 'check-out-order?id='+order_id;
		case 3: return 'transfer-order?id='+order_id;
		default: return '';
	}
}

function getPagePrefix(page) {
	switch(page) {
		case 'check-in': 		return 'lci';
		case 'check-in-order': 	return 'nci';
		case 'check-out': 		return 'lco';
		case 'check-out-order': return 'nco';
		case 'transfer': 		return 'lct';
		case 'transfer-order': 	return 'nct';
		case 'list-stock': 		return 'l';
		case 'stock': 			return 's';
		case 'list-whouse': 	return 'lwh';
		case 'list-item': 		return 'lit';
		case 'item': 			return 'it';
		case 'list-contact': 	return 'lep';		
	}
}

function getDetailPage(page) {
	switch(page) {
		case 'check-in': return 'check-in-order';
		case 'check-out': return 'check-out-order';
		case 'transfer': return 'transfer-order';
		case 'list-stock': return 'stock';
		case 'list-whouse': return 'whouse';
		case 'list-item': return 'item';
		case 'list-contact': return 'contact';
		case 'list-prediction': return 'prediction';
		case 'list-alert': return 'alert';
	}
}

function getEmpWhouseStr(emp_id, forSearch) {
	var emp = alasql('select * from emp where id=?', [emp_id])[0];
	var whouses = alasql('select whouse.* from emp_whouse join whouse on whouse.id = emp_whouse.whouse_id where emp_whouse.emp_id=?;', [emp_id]);
	if (emp.title == 2) {
		if (forSearch) {
			return alasql('select * from whouse;').map(function(w){return w.name}).join(', ');
		}
		return 'All warehouses';
	}
	if (whouses.length == 0) {
		return '';
	}
	return whouses.map(function(w){return w.name}).join(', ');
}

var list_stock_sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, itembatch.lot, itembatch.cost, stock.balance, item.unit \
			FROM stock \
			JOIN whouse ON whouse.id = stock.whouse_id \
			JOIN itembatch ON stock.itembatch_id = itembatch.id \
			JOIN item ON item.id = itembatch.item_id \
			JOIN kind ON kind.id = item.kind_id;';

var DB = {};

DB.loadFinish = false;

DB.getUser = function() {
	var items = document.cookie.split(';').map(function(i){return i.trim()});
	var obj = {};
	items.forEach(function(i){
		var key = i.split('=')[0];
		var value = i.split('=')[1];
		obj[key] = value;
	});

	try {
		if (obj['uid'] && parseInt(obj['uid']) > 0) {
			return alasql('select * from user where id = ?;', [parseInt(obj['uid'])])[0];
		} else {
			return undefined;
		}
	} catch(e) {
		return undefined;
	}
};

DB.getSetting = function() {
	try {
		var user = DB.getUser();
		return JSON.parse(alasql('select * from setting where uid = ?;', [user.id])[0].json);
	} catch(e) {
		return {};
	}
}

DB.updateSetting = function(settingObj) {
	var user = DB.getUser();
	var jsonStr = JSON.stringify(settingObj);
	alasql('update setting set json=? where uid = ?;', [jsonStr, user.id]);
	return JSON.parse(alasql('select * from setting where uid = ?;', [user.id])[0].json);
}

DB.getUserEmp = function() {
	var user = DB.getUser();
	return alasql('select * from emp where id = ?;', [user.emp_id])[0];
}

DB.keeperPriorityWhouse = function(whouseid) {
	var emp = DB.getUserEmp();
	return alasql('select * from emp_whouse where whouse_id = ? and emp_id = ?;', [whouseid, emp.id]).length > 0;
}

DB.getChargeWhouseNamesArr = function() {
	var emp = DB.getUserEmp();
	if (emp.title == 4 || emp.title == 5) {
		return alasql('select whouse.name from emp_whouse left join whouse on whouse.id = emp_whouse.id where emp_id = ?;', [emp.id]).map(function(i){return i.name;});
	} else {
		return alasql('select * from whouse;').map(function(i){return i.name;});
	}
}

function secret(str) {
	var emp = DB.getUserEmp();
	if (emp.title <= 4) {
		return str;
	}
	return 'Secret';
}

DB.isWorkerTask = function(order_type, order_id, worker_cid) {
	return (alasql('select * from task where order_type=? and order_id=? and worker_cid=?;', [order_type, order_id, worker_cid]).length) > 0;
}

DB.getWorkerTask = function(order_type, order_id, worker_cid) {
	return alasql('select * from task where order_type=? and order_id=? and worker_cid=?;', [order_type, order_id, worker_cid])[0].task_name;
}

DB.getWorkerAllTask = function(order_type, order_id, worker_cid) {
	return alasql('select * from task where order_type=? and order_id=? and worker_cid=?;', [order_type, order_id, worker_cid]).map(function(t){return t.task_name});
}

DB.getCid = function() {
	return parseInt(DB.getUserEmp().id);
}

DB.findContact = function(cid, isEmp) {
	if (isEmp) return alasql('select * from emp where id = ?;', [cid])[0];
	return cid < 0 ? alasql('select * from emp where id = ?;', [-cid])[0] : alasql('select * from partner where id = ?;', [cid])[0];
}


DB.constructPredicitonStr = function(itembatch_id, whouse_id, add, date, order_type, is_transfer_in, change) {
	var str = 'prediction?itembatch_id='+itembatch_id+'&whouse_id='+whouse_id;
	if(add) {
		str += ('&add='+add+'&date='+date+'&order_type='+order_type+'&is_transfer_in='+is_transfer_in+'&change='+change);
	}
	return str;
}

DB.insertMessage = function(cid, message, url, message_type) {
	try {
		var message_id = alasql('select MAX(id) as id from message;')[0].id + 1;	
		message_id = message_id ? message_id : 1;	
	} catch(e) {
		var message_id = 1;
	}
	alasql('INSERT INTO message(id, cid, message, is_read, is_star, url, message_type) VALUES(?,?,?,?,?,?,?);',
		[message_id, cid, message, 0, 0, url, message_type]);
}

DB.markMessageRead = function(id) {
	id = parseInt(id);
	alasql('UPDATE message set is_read=? where id=?;', [1, id]);
	return alasql('select * from message where id=?;', [id])[0];
}

DB.markMessageStar = function(id, isToStar) {
	isToStar = (isToStar === true || isToStar === 1 || isToStar === 'true')?1:0;
	alasql('UPDATE message set is_star=? where id=?;', [isToStar, id]);
	return alasql('select * from message where id=?;', [id])[0];
}

DB.getOrder = function(order_type, order_id) {
	order_type = parseInt(order_type);
	order_id = parseInt(order_id);
	switch(order_type) {
		case 1: return alasql('select * from inorder where id = ?;', [order_id])[0];
		case 2: return alasql('select * from outorder where id = ?;', [order_id])[0];
		case 3: return alasql('select * from transferorder where id = ?;', [order_id])[0];
	}
}

DB.getInchargeKeeperCidArr = function(whouse_id) {
	whouse_id = parseInt(whouse_id);
	return alasql('select emp_whouse.* from emp_whouse left join emp on emp.id=emp_whouse.emp_id where whouse_id = ? and emp.title=?;', [whouse_id, 4]).map(function(i){return i.emp_id;});
}

DB.insertApplyMessage = function(order_type, order_id) {
	order_type = parseInt(order_type);
	order_id = parseInt(order_id);
	var order = DB.getOrder(order_type, order_id);
	var whouse_id = order_type == 3 ? order.whouse_out_id : order.whouse_id;

	DB.getInchargeKeeperCidArr(whouse_id).forEach(function(cid) {
		switch(order_type) {
			case 1: var message = 'Please approve/deny check-in application('+order_id+').';
					var url = 'check-in-order?id='+order_id;
					var message_type = 11;
					break;
			case 2: var message = 'Please approve/deny check-out application('+order_id+').';
					var url = 'check-out-order?id='+order_id;
					var message_type = 21;
					break;
			case 3: var message = 'Please approve/deny transfer application('+order_id+').';
					var url = 'transfer-order?id='+order_id;
					var message_type = 31;
					break;
		}
		DB.insertMessage(cid, message, url, message_type);
	});
}

DB.insertApproveMessage = function(order_type, order_id) {
	order_type = parseInt(order_type);
	order_id = parseInt(order_id);
	var order = DB.getOrder(order_type, order_id);
	switch(order_type) {
		case 1: var message = 'Your check-in application('+order_id+') has been approved.';
				var url = 'check-in-order?id='+order_id;
				var message_type = 12;
				break;
		case 2: var message = 'Your check-out application('+order_id+') has been approved.';
				var url = 'check-out-order?id='+order_id;
				var message_type = 22;
				break;
		case 3: var message = 'Your transfer application('+order_id+') has been approved.';
				var url = 'transfer-order?id='+order_id;
				var message_type = 32;
				break;
	}
	DB.insertMessage(order.applyer_cid, message, url, message_type);
}

DB.insertTaskMessage = function(cid, order_type, order_id, task_name) {
	order_type = parseInt(order_type);
	order_id = parseInt(order_id);
	var num = task_name == 'picking'? 0:(task_name == 'inspection'? 1:(task_name == 'placing'?2:3));
	switch(order_type) {
		case 1: var message = 'You have been allocated a "'+task_name+'" task. (Check-in: '+order_id+')';
				var url = 'check-in-order?id='+order_id;
				var message_type = parseInt(41+''+num);
				break;
		case 2: var message = 'You have been allocated a "'+task_name+'" task. (Check-out: '+order_id+')';
				var url = 'check-out-order?id='+order_id;
				var message_type = parseInt(42+''+num);
				break;
		case 3: var message = 'You have been allocated a "'+task_name+'" task. (Transfer: '+order_id+')';
				var url = 'transfer-order?id='+order_id;
				var message_type = parseInt(43+''+num);
				break;
	}
	DB.insertMessage(cid, message, url, message_type);
}

DB.getStock = function(itembatch_id, whouse_id, stock_id) {
	itembatch_id = isNaN(parseInt(itembatch_id)) ? itembatch_id : parseInt(itembatch_id);
	whouse_id = isNaN(parseInt(whouse_id)) ? whouse_id : parseInt(whouse_id);
	stock_id = isNaN(parseInt(stock_id)) ? stock_id : parseInt(stock_id);

	if (typeof stock_id !== 'number') {
		var stock = alasql('select * from stock where itembatch_id = ? and whouse_id = ?;', [itembatch_id, whouse_id])[0];
		stock_id = stock ? stock.id:stock_id;
	}
	if (!stock_id) {
		var res =  alasql('select whouse.name as whouse_name, whouse.id as whouse_id, whouse.code as whouse_code,\
					 			itembatch.lot, itembatch.expiration_date, itembatch.deadline_date, item.detail as item_name\
							from itembatch \
							left join item on itembatch.item_id=item.id cross join whouse where itembatch.id=? and whouse.id=?', [itembatch_id, whouse_id])[0];
		res.min_balance = 0;	
		res.balance = 0;
		res.stock_id = 0;
		return res;
	} else {
		return alasql('select whouse.name as whouse_name, whouse.id as whouse_id, whouse.code as whouse_code,\
					 		itembatch.lot, itembatch.expiration_date, itembatch.deadline_date, item.detail as item_name,\
							stock.id as stock_id, stock.min_balance, stock.balance\
						from stock left join itembatch on stock.itembatch_id=itembatch.id\
						left join item on itembatch.item_id=item.id left join whouse on whouse.id=stock.whouse_id where stock.id=?;', [stock_id])[0];
	}

}

DB.insertPredictionMessage = function(itembatch_id, whouse_id) {
	itembatch_id = parseInt(itembatch_id);
	whouse_id = parseInt(whouse_id);
	var stock = DB.getStock(itembatch_id, whouse_id);
	DB.getInchargeKeeperCidArr(whouse_id).forEach(function(cid) {	
		var url = 'prediction?itembatch_id='+itembatch_id+'&whouse_id='+whouse_id;
		if (alasql('select * from message where cid=? and url=? and message_type=? and is_read=?;', [cid, url, parseInt(800), 0]).length == 0) {	
			DB.insertMessage(cid, '"'+stock.item_name+'"('+stock.lot+')'+' in "'+stock.whouse_name+'" has great risk to be out-of-stock/oversold in future.',
					url, parseInt(800));
		}
	})
}

DB.insertMinimumMessage = function(stock_id) {
	stock_id = parseInt(stock_id);
	var stock = DB.getStock(null, null, stock_id);
	if (stock.balance < stock.min_balance) {
		DB.getInchargeKeeperCidArr(stock.whouse_id).forEach(function(cid) {		
			var url = 'stock?id='+stock.stock_id;
			if (alasql('select * from message where cid=? and url=? and message_type=? and is_read=?;', [cid, url, parseInt(810), 0]).length == 0) {	
				DB.insertMessage(cid, 'The amount of "'+stock.item_name+'"('+stock.lot+')'+' in "'+stock.whouse_name+'" is below the minimum alert level.',
						url, parseInt(810));
			}
		});
	}
}

DB.insertExpireMessage = function(stock_id) {
	stock_id = parseInt(stock_id);
	var stock = DB.getStock(null, null, stock_id);
	today = parseDate(new Date()).substring(0, 10);
	if ((stock.deadline_date && stock.deadline_date < today) || (stock.expiration_date &&  stock.expiration_date<today)) {		
		DB.getInchargeKeeperCidArr(stock.whouse_id).forEach(function(cid) {		
			var url = 'stock?id='+stock.stock_id;
			if (alasql('select * from message where cid=? and url=? and message_type=?', [cid, url, parseInt(820)]).length == 0) {
				DB.insertMessage(cid, 'The "'+stock.item_name+'"('+stock.lot+')'+' in "'+stock.whouse_name+'" is close to the expiration date',
						url, parseInt(820));
			}
		});
	}
}

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// kinds	
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/kind.csv", {headers: true})').then(function(kinds) {
		alasql('DROP TABLE IF EXISTS kind;');
		alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// Items	
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/item.csv", {headers: true})').then(function(items) {
		alasql('DROP TABLE IF EXISTS item;');
		alasql('CREATE TABLE item(id INT IDENTITY, code STRING, kind_id INT, detail STRING, comment STRING, maker STRING, unit STRING);');
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?);', item);
		}
	});

	// ItemBatch	
	var pitembatch = alasql.promise('SELECT MATRIX * FROM CSV("data/itembatch.csv", {headers: true})').then(
		function(rows) {
			alasql('DROP TABLE IF EXISTS itembatch;');
			alasql('CREATE TABLE itembatch(id INT IDENTITY, item_id INT, lot STRING, expiration_date DATE, description STRING, deadline_date STRING, cost INT, cost_unit STRING);');
			for (var i = 0; i < rows.length; i++) {
				var item = rows[i];
				alasql('INSERT INTO itembatch VALUES(?,?,?,?,?,?,?,?);', item);
			}
		});

	// Warehouses	
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/whouse.csv", {headers: true})').then(
			function(whouses) {
				alasql('DROP TABLE IF EXISTS whouse;');
				alasql('CREATE TABLE whouse(id INT IDENTITY, code STRING, name STRING, addr STRING, tel STRING);');
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?,?);', whouse);
				}
			});

	// stock	
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/stock.csv", {headers: true})').then(
			function(stocks) {
				alasql('DROP TABLE IF EXISTS stock;');
				alasql('CREATE TABLE stock(id INT IDENTITY, itembatch_id INT, whouse_id INT, balance INT, min_balance INT);');
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?,?);', stock);
				}
			});

	// Transaction	
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/trans.csv", {headers: true})').then(
			function(transs) {
				alasql('DROP TABLE IF EXISTS trans;');
				alasql('CREATE TABLE trans(id INT IDENTITY, stock_id INT, date STRING, qty INT, balance INT, memo STRING, order_type INT, order_id INT);');
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?);', trans);
				}
			});

	// Partner	
	var ppartner = alasql.promise('SELECT MATRIX * FROM CSV("data/partner.csv", {headers: true})').then(
			function(partners) {
				alasql('DROP TABLE IF EXISTS partner;');
				alasql('CREATE TABLE partner(id INT IDENTITY, emp_num STRING, name STRING, gender INT, tel STRING, email STRING, title STRING, company STRING, isActive INT);');
				for (var i = 0; i < partners.length; i++) {
					var partner = partners[i];
					alasql('INSERT INTO partner VALUES(?,?,?,?,?,?,?,?,?);', partner);
				}
			});

	// employee	
	var pemp = alasql.promise('SELECT MATRIX * FROM CSV("data/emp.csv", {headers: true})').then(
			function(emps) {
				alasql('DROP TABLE IF EXISTS emp;');
				alasql('CREATE TABLE emp(id INT IDENTITY, emp_num STRING, name STRING, gender INT, tel STRING, email STRING, title INT, isActive INT);');
				for (var i = 0; i < emps.length; i++) {
					var emp = emps[i];
					alasql('INSERT INTO emp VALUES(?,?,?,?,?,?,?,?);', emp);
				}
			});

	// tem_contact	
	var ptem_contact = alasql.promise('SELECT MATRIX * FROM CSV("data/tem_contact.csv", {headers: true})').then(
			function(tem_contacts) {
				alasql('DROP TABLE IF EXISTS tem_contact;');
				alasql('CREATE TABLE tem_contact(id INT IDENTITY, emp_num STRING, name STRING, gender INT, tel STRING, email STRING, title STRING, company STRING, addr STRING, isActive INT);');
				for (var i = 0; i < tem_contacts.length; i++) {
					var tem_contact = tem_contacts[i];
					alasql('INSERT INTO tem_contact VALUES(?,?,?,?,?,?,?,?,?,?);', tem_contact);
				}
			});

	// emp-warehouse	
	var pemp_whouse = alasql.promise('SELECT MATRIX * FROM CSV("data/emp_whouse.csv", {headers: true})').then(
			function(emp_whouses) {
				alasql('DROP TABLE IF EXISTS emp_whouse;');
				alasql('CREATE TABLE emp_whouse(id INT IDENTITY, emp_id INT, whouse_id INT);');
				for (var i = 0; i < emp_whouses.length; i++) {
					var emp_whouse = emp_whouses[i];
					alasql('INSERT INTO emp_whouse VALUES(?,?,?);', emp_whouse);
				}
			});

	// inorder	
	var pinorder = alasql.promise('SELECT MATRIX * FROM CSV("data/inorder.csv", {headers: true})').then(
			function(inorders) {
				alasql('DROP TABLE IF EXISTS inorder;');
				alasql('CREATE TABLE inorder(id INT IDENTITY, applyer_cid INT, apply_time STRING, update_time STRING, status INT, reason STRING, comment STRING, supplier_name STRING, supplier_cid INT, supplier_type INT, whouse_id INT);');
				for (var i = 0; i < inorders.length; i++) {
					var inorder = inorders[i];
					alasql('INSERT INTO inorder VALUES(?,?,?,?,?,?,?,?,?,?,?);', inorder);
				}
			});

	// outorder	
	var poutorder = alasql.promise('SELECT MATRIX * FROM CSV("data/outorder.csv", {headers: true})').then(
			function(outorders) {
				alasql('DROP TABLE IF EXISTS outorder;');
				alasql('CREATE TABLE outorder(id INT IDENTITY, applyer_cid INT, apply_time STRING, update_time STRING, status INT, reason STRING, comment STRING, buyer_name STRING, buyer_cid INT, buyer_type INT, whouse_id INT);');
				for (var i = 0; i < outorders.length; i++) {
					var outorder = outorders[i];
					alasql('INSERT INTO outorder VALUES(?,?,?,?,?,?,?,?,?,?,?);', outorder);
				}
			});

	// transferorder		
	var ptransferorder = alasql.promise('SELECT MATRIX * FROM CSV("data/transferorder.csv", {headers: true})').then(
			function(transferorders) {
				alasql('DROP TABLE IF EXISTS transferorder;');
				alasql('CREATE TABLE transferorder(id INT IDENTITY, applyer_cid INT, apply_time STRING, update_time STRING, status INT, reason STRING, comment STRING, whouse_out_id INT, whouse_in_id INT);');
				for (var i = 0; i < transferorders.length; i++) {
					var transferorder = transferorders[i];
					alasql('INSERT INTO transferorder VALUES(?,?,?,?,?,?,?,?,?);', transferorder);
				}
			});


	// orderitembatch	
	var porderitembatch = alasql.promise('SELECT MATRIX * FROM CSV("data/orderitembatch.csv", {headers: true})').then(
			function(orderitembatchs) {
				alasql('DROP TABLE IF EXISTS orderitembatch;');
				alasql('CREATE TABLE orderitembatch(id INT IDENTITY, order_id INT, order_type INT, itembatch_id INT, balance INT, actual_balance INT, place_in STRING);');
				for (var i = 0; i < orderitembatchs.length; i++) {
					var orderitembatch = orderitembatchs[i];
					alasql('INSERT INTO orderitembatch VALUES(?,?,?,?,?,?,?);', orderitembatch);
				}
			});

	// orderstatushistory	
	var porderstatushistory = alasql.promise('SELECT MATRIX * FROM CSV("data/orderstatushistory.csv", {headers: true})').then(
			function(orderstatushistorys) {
				alasql('DROP TABLE IF EXISTS orderstatushistory;');
				alasql('CREATE TABLE orderstatushistory(id INT IDENTITY, order_id INT, order_type INT, who_cid INT, time STRING, from_status INT, to_status INT, comment STRING);');
				for (var i = 0; i < orderstatushistorys.length; i++) {
					var orderstatushistory = orderstatushistorys[i];
					alasql('INSERT INTO orderstatushistory VALUES(?,?,?,?,?,?,?,?);', orderstatushistory);
				}
			});


	//transport	
	var ptransport = alasql.promise('SELECT MATRIX * FROM CSV("data/transport.csv", {headers: true})').then(
			function(transports) {
				alasql('DROP TABLE IF EXISTS transport;');
				alasql('CREATE TABLE transport(id INT IDENTITY, order_type INT, order_id INT, company STRING, num STRING, delivery_date STRING, arrival_date STRING);');
				for (var i = 0; i < transports.length; i++) {
					var transport = transports[i];
					alasql('INSERT INTO transport VALUES(?,?,?,?,?,?,?);', transport);
				}
			});


	//task	
	var ptask = alasql.promise('SELECT MATRIX * FROM CSV("data/task.csv", {headers: true})').then(
			function(tasks) {
				alasql('DROP TABLE IF EXISTS task;');
				alasql('CREATE TABLE task(id INT IDENTITY, order_type INT, order_id INT, task_name STRING, applyer_cid INT, worker_cid INT, begin_date STRING, apply_time STRING, finish_time STRING, status STRING);');
				for (var i = 0; i < tasks.length; i++) {
					var task = tasks[i];
					alasql('INSERT INTO task VALUES(?,?,?,?,?,?,?,?,?,?);', task);
				}
			});

	//user	
	var puser = alasql.promise('SELECT MATRIX * FROM CSV("data/user.csv", {headers: true})').then(
			function(users) {
				alasql('DROP TABLE IF EXISTS user;');
				alasql('CREATE TABLE user(id INT IDENTITY, username STRING, password STRING, priority INT, emp_id INT);');
				for (var i = 0; i < users.length; i++) {
					var user = users[i];
					alasql('INSERT INTO user VALUES(?,?,?,?,?);', user);
				}
			});

	//place		
	var pplace = alasql.promise('SELECT MATRIX * FROM CSV("data/place.csv", {headers: true})').then(
			function(places) {
				alasql('DROP TABLE IF EXISTS place;');
				alasql('CREATE TABLE place(id INT IDENTITY, itembatch_id INT, whouse_id INT, balance INT, place STRING);');
				for (var i = 0; i < places.length; i++) {
					var place = places[i];
					alasql('INSERT INTO place VALUES(?,?,?,?,?);', place);
				}
			});

	//pick		
	var ppick = alasql.promise('SELECT MATRIX * FROM CSV("data/pick.csv", {headers: true})').then(			
			function(picks) {
				alasql('DROP TABLE IF EXISTS pick;');
				alasql('CREATE TABLE pick(id INT IDENTITY, orderitembatch_id INT, place STRING, amount INT);');
				for (var i = 0; i < picks.length; i++) {
					var pick = picks[i];
					alasql('INSERT INTO pick VALUES(?,?,?,?);', pick);
				}
			});

	//message	
	var pmessage = alasql.promise('SELECT MATRIX * FROM CSV("data/message.csv", {headers: true})').then(
			function(messages) {
				alasql('DROP TABLE IF EXISTS message;');
				alasql('CREATE TABLE message(id INT IDENTITY, cid INT, message STRING, is_read INT, is_star INT, url STRING, message_type INT);');
				for (var i = 0; i < messages.length; i++) {
					var message = messages[i];
					alasql('INSERT INTO message VALUES(?,?,?,?,?,?,?);', message);
				}
			});

	//setting
	var psetting = alasql.promise('SELECT MATRIX * FROM CSV("data/setting.csv", {headers: true})').then(
			function(settings) {
				alasql('DROP TABLE IF EXISTS setting;');
				alasql('CREATE TABLE setting(id INT IDENTITY, uid INT, json STRING);');
				for (var i = 0; i < settings.length; i++) {
					var setting = settings[i];
					alasql('INSERT INTO setting VALUES(?,?,?);', setting);
				}
			});

	// Reload page
	Promise.all([ pkind, pitem, pitembatch, pwhouse, pstock, 
				ptrans, ppartner, pemp, ptem_contact, pinorder, 
				poutorder, ptransferorder, porderitembatch, porderstatushistory, ptransport, 
				pemp_whouse, ptask, puser, pplace, ppick,
				pmessage, psetting]).then(function() {
		DB.loadFinish = true;
		window.location.reload(true);		
		console.log('load all csv files success');
	});
};

DB.remove = function() {
	if (window.confirm('are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE STK')
	}
};


DB.listCheckin = function() {
	var list_checkin_sql = 'SELECT inorder.*, whouse.code as whouse_code, whouse.name as whouse_name, e.name as applyer_c_name \
					from inorder\
					left join whouse on 		inorder.whouse_id = whouse.id\
					left join emp as e on 		e.id = inorder.applyer_cid;';
	var results = alasql(list_checkin_sql);
	results = results.map(function(i){
		i.supplier_c_name = alasql('select * from ' + (i.supplier_type == 1 ? 'emp' : (i.supplier_type == 2 ? 'partner' : 'tem_contact'))  + ' where id = ?;', [i.supplier_cid])[0].name;
		return i;
	});	
	return results;
}



DB.saveCheckinOrder = function(applyer_cid, supplier_cid, supplier_name, supplier_type, whouse_id, reason, comment, arrival_date, $trs) {
	applyer_cid = parseInt(applyer_cid);
	supplier_cid = parseInt(supplier_cid);
	whouse_id = parseInt(whouse_id);
	supplier_type = parseInt(supplier_type);
	try {
		var inorder_id = alasql('select MAX(id) as id from inorder;')[0].id + 1;	
		inorder_id = inorder_id ? inorder_id : 1;	
	} catch(e) {
		var inorder_id = 1;
	}
	try {	
		var orderitembatch_id = alasql('select MAX(id) as id from orderitembatch;')[0].id + 1;
		orderitembatch_id = orderitembatch_id ? orderitembatch_id : 1;
	} catch(e) {
		var orderitembatch_id = 1;
	}
	try {		
		var orderstatushistory_id = alasql('select MAX(id) as id from orderstatushistory;')[0].id + 1;
		orderstatushistory_id = orderstatushistory_id ? orderstatushistory_id : 1;
	} catch(e) {
		var orderstatushistory_id = 1;
	}
	try {		
		var transport_id = alasql('select MAX(id) as id from transport;')[0].id+1;
		transport_id = transport_id ? transport_id : 1;
	} catch(e) {
		var transport_id = 1;
	}
	try {
		var task_id = alasql('select MAX(id) as id from task;')[0].id+1;
		task_id = task_id ? task_id : 1;		
	} catch(e) {
		var task_id = 1;
	}

	var date = parseDate(new Date()); 
	alasql('INSERT INTO inorder(id, applyer_cid, apply_time, update_time, status, reason, comment, supplier_name, supplier_cid, supplier_type, whouse_id) VALUES(?,?,?,?,?,?,?,?,?,?,?);',
		[inorder_id, applyer_cid, date, date, 1, reason, comment, supplier_name, supplier_cid, supplier_type, whouse_id]);
	$trs.each(function(){
		var tr = $(this);
		var itembatch_id = parseInt(tr.find('select').val());
		var balance = parseInt(tr.find('input[name=balance]').val());
		alasql('INSERT INTO orderitembatch(id, order_id, order_type, itembatch_id, balance, actual_balance, place_in) VALUES(?,?,?,?,?,?,?);', 
			[orderitembatch_id++, inorder_id, 1, itembatch_id, balance, balance, '']);
	});
	alasql('INSERT INTO orderstatushistory(id, order_id, order_type, who_cid, time, from_status, to_status, comment) value(?,?,?,?,?,?,?,?)',
		[orderstatushistory_id, inorder_id, 1, applyer_cid, date, 0, 1, 'Created']);
	alasql('INSERT INTO transport(id, order_type, order_id, company, num, delivery_date, arrival_date) VALUES(?,?,?,?,?,?,?);', [transport_id, 1, inorder_id, '', '', '', arrival_date]);
	alasql('INSERT INTO task(id, order_type, order_id, task_name, applyer_cid, worker_cid, begin_date, apply_time, finish_time, status) VALUES(?,?,?,?,?,?,?,?,?,?);', 
			[task_id++, 1, inorder_id, 'inspection', applyer_cid, 0, '', '', '', '']);
	alasql('INSERT INTO task(id, order_type, order_id, task_name, applyer_cid, worker_cid, begin_date, apply_time, finish_time, status) VALUES(?,?,?,?,?,?,?,?,?,?);', 
			[task_id++, 1, inorder_id, 'placing', applyer_cid, 0, '', '', '', '']);
	DB.insertApplyMessage(1, inorder_id);
	return inorder_id;
};

DB.updateCheckinOrder = function(inorder, newStatus, statusComment, transCompany, transNum, transDeliTime, transArriTime, inspectionCid, placingCid, $inspectionTrs, $placingTrs) {
	newStatus = parseInt(newStatus);
	inspectionCid = parseInt(inspectionCid);
	placingCid = parseInt(placingCid);	

	try {		
		var orderstatushistory_id = alasql('select MAX(id) as id from orderstatushistory;')[0].id + 1;
		orderstatushistory_id = orderstatushistory_id ? orderstatushistory_id : 1;
	} catch(e) {
		var orderstatushistory_id = 1;
	}
	var date = parseDate(new Date());

	alasql('INSERT INTO orderstatushistory(id, order_id, order_type, who_cid, time, from_status, to_status, comment) value(?,?,?,?,?,?,?,?)',
		[orderstatushistory_id, inorder.id, 1, DB.getCid(), date, inorder.status, newStatus, statusComment]);
	alasql('UPDATE inorder SET status = ?, update_time = ? where id = ?;', [newStatus, date, inorder.id]);
	alasql('UPDATE transport SET company = ?, num = ?, delivery_date=?, arrival_date = ? where order_type = ? and order_id = ?;', [transCompany, transNum, transDeliTime, transArriTime, 1, inorder.id]);

	var inspectionTask = alasql('SELECT * from task where order_type = ? and order_id = ? and task_name = ?;', [1, inorder.id, 'inspection'])[0];
	var placingTask	 = alasql('SELECT * from task where order_type = ? and order_id = ? and task_name = ?;', [1, inorder.id, 'placing'])[0];
	if (inspectionTask.worker_cid != inspectionCid) {
		alasql('UPDATE task SET applyer_cid = ?, worker_cid = ?, apply_time = ?, status = ? where id = ?;', [DB.getCid(), inspectionCid, date, 'Unfinished', inspectionTask.id]);
		DB.insertTaskMessage(inspectionCid, 1, inorder.id, 'inspection');
	}
	if (placingTask.worker_cid != placingCid) {
		alasql('UPDATE task SET applyer_cid = ?,worker_cid = ?, apply_time = ?, status = ? where id = ?;', [DB.getCid(), placingCid, date, 'Unfinished', placingTask.id]);
		DB.insertTaskMessage(placingCid, 1, inorder.id, 'placing');
	}
	if (newStatus >= 8 && inorder.status <= 6) {
		alasql('UPDATE task SET finish_time = ?, status = ? where id = ?;', [date, 'Done', inspectionTask.id]);
	}
	if (newStatus >= 9 && inorder.status <= 8) {
		alasql('UPDATE task SET finish_time = ?, status = ? where id = ?;', [date, 'Done', placingTask.id]);
	}
	if (newStatus == 4) {
		DB.insertApproveMessage(1, inorder.id)
	}
	
	$inspectionTrs.each(function(){
		var tr = $(this);
		alasql('UPDATE orderitembatch SET actual_balance = ? where id = ? ;', [parseInt(tr.find('input[name=act-num]').val()), parseInt(tr.attr('pid'))]);			
	});
	$placingTrs.each(function(){
		var tr = $(this);
		alasql('UPDATE orderitembatch SET place_in = ? where id = ?;', [tr.find('input[name=place-input]').val(), parseInt(tr.attr('pid'))]);		
	});

	if (newStatus == 9) {
		var orderitembatchs = alasql('select orderitembatch.*, inorder.whouse_id, inorder.reason from orderitembatch left join inorder on orderitembatch.order_id = inorder.id\
		 					where orderitembatch.order_type = ? and orderitembatch.order_id = ?;', [1, inorder.id]);		
		orderitembatchs.forEach(function(i) {
			var stock = alasql('select * from stock where itembatch_id = ? and whouse_id = ?;', [i.itembatch_id, i.whouse_id])[0];
			if (stock === undefined) {
				try {
					var stock_id = alasql('select MAX(id) as id from stock;')[0].id+1;	
					stock_id = stock_id ? stock_id : 1;	
				} catch(e) {
					var stock_id = 1;
				}
				alasql('INSERT INTO stock(id, itembatch_id, whouse_id, balance,min_balance) VALUES(?,?,?,?,?);', [stock_id, i.itembatch_id, i.whouse_id, i.actual_balance, 0]);
			} else {
				alasql('UPDATE stock SET balance = ? where id = ?;', [stock.balance+i.actual_balance, stock.id]);
			}

			var place = alasql('select * from place where itembatch_id = ? and whouse_id = ? and place = ?;', [i.itembatch_id, i.whouse_id, i.place_in])[0];
			if (place === undefined) {
				try {
					var place_id = alasql('select MAX(id) as id from place;')[0].id+1;		
					place_id = place_id ? place_id : 1;
				} catch(e) {
					var place_id = 1;
				}
				alasql('INSERT INTO place(id, itembatch_id, whouse_id, balance, place) VALUES(?,?,?,?,?);', [place_id, i.itembatch_id, i.whouse_id, i.actual_balance, i.place_in]);
			} else {
				alasql('UPDATE place SET balance = ? where id = ?;', [place.balance+i.actual_balance, place.id]);
			}

			try {
				var trans_id = alasql('select MAX(id) as id from trans;')[0].id+1;	
				trans_id = trans_id ? trans_id : 1;
			} catch(e) {
				var trans_id = 1;
			}
			alasql('INSERT INTO trans(id, stock_id, date, qty, balance, memo, order_type, order_id) VALUES(?,?,?,?,?,?,?,?);', [trans_id, stock ? stock.id : stock_id, date, i.actual_balance, stock ? stock.balance+i.actual_balance : i.actual_balance, inorder.reason ? inorder.reason : '', 1, inorder.id]);
		});
	}
}

DB.listCheckout = function() {
	var list_checkout_sql = 'SELECT outorder.*, whouse.code as whouse_code, whouse.name as whouse_name, e.name as applyer_c_name \
					from outorder\
					left join whouse on 		outorder.whouse_id = whouse.id\
					left join emp as e on 		e.id = outorder.applyer_cid;';
	var results = alasql(list_checkout_sql);	
	results = results.map(function(i){
		i.buyer_c_name = alasql('select * from ' + (i.buyer_type == 1 ? 'emp' : (i.buyer_type == 2 ? 'partner' : 'tem_contact'))  + ' where id = ?;', [i.buyer_cid])[0].name;
		return i;
	});
	return results;
}

DB.saveCheckoutOrder = function(applyer_cid, buyer_name, buyer_tel, buyer_company, buyer_cid, buyer_type, buyer_addr, whouse_id, reason, comment, delivery_date, $trs) {
	applyer_cid = parseInt(applyer_cid);
	buyer_cid = parseInt(buyer_cid);
	buyer_type = parseInt(buyer_type);
	whouse_id = parseInt(whouse_id);	
	try {
		var outorder_id = alasql('select MAX(id) as id from outorder;')[0].id + 1;	
		outorder_id = outorder_id ? outorder_id : 1;	
	} catch(e) {
		var outorder_id = 1;
	}
	try {	
		var orderitembatch_id = alasql('select MAX(id) as id from orderitembatch;')[0].id + 1;
		orderitembatch_id = orderitembatch_id ? orderitembatch_id : 1;
	} catch(e) {
		var orderitembatch_id = 1;
	}
	try {		
		var orderstatushistory_id = alasql('select MAX(id) as id from orderstatushistory;')[0].id + 1;
		orderstatushistory_id = orderstatushistory_id ? orderstatushistory_id : 1;
	} catch(e) {
		var orderstatushistory_id = 1;
	}
	try {		
		var transport_id = alasql('select MAX(id) as id from transport;')[0].id+1;
		transport_id = transport_id ? transport_id : 1;
	} catch(e) {
		var transport_id = 1;
	}
	try {
		var task_id = alasql('select MAX(id) as id from task;')[0].id+1;
		task_id = task_id ? task_id : 1;		
	} catch(e) {
		var task_id = 1;
	}
	try {
		var tem_contact_id = alasql('select MAX(id) as id from tem_contact;')[0].id+1;
		tem_contact_id = tem_contact_id ? tem_contact_id : 1;
	} catch(e) {
		var tem_contact_id = 1;		
	}

	if (!buyer_cid) {
		alasql('INSERT INTO tem_contact(id, emp_num, name, gender, tel, email, title, company, addr, isActive) VALUES(?,?,?,?,?,?,?,?,?,?);',
			[tem_contact_id, '', buyer_name, 0, buyer_tel, '', '', buyer_company, buyer_addr, 1]);
		buyer_cid = tem_contact_id;
		buyer_type = 3;
	}

	var date = parseDate(new Date()); 
	alasql('INSERT INTO outorder(id, applyer_cid, apply_time, update_time, status, reason, comment, buyer_name, buyer_cid, buyer_type, whouse_id) VALUES(?,?,?,?,?,?,?,?,?,?,?);',
		[outorder_id, applyer_cid, date, date, 1, reason, comment, buyer_addr, buyer_cid, buyer_type, whouse_id]);
	$trs.each(function(){
		var tr = $(this);
		var itembatch_id = parseInt(tr.find('select').val());
		var balance = parseInt(tr.find('input[name=balance]').val());
		alasql('INSERT INTO orderitembatch(id, order_id, order_type, itembatch_id, balance, actual_balance, place_in) VALUES(?,?,?,?,?,?,?,?);', 
			[orderitembatch_id++, outorder_id, 2, itembatch_id, balance, balance, '']);
	});
	alasql('INSERT INTO orderstatushistory(id, order_id, order_type, who_cid, time, from_status, to_status, comment) value(?,?,?,?,?,?,?,?)',
		[orderstatushistory_id, outorder_id, 2, applyer_cid, date, 0, 1, 'Created']);
	alasql('INSERT INTO transport(id, order_type, order_id, company, num, delivery_date, arrival_date) VALUES(?,?,?,?,?,?,?);', [transport_id, 2, outorder_id, '', '', delivery_date, '']);	
	alasql('INSERT INTO task(id, order_type, order_id, task_name, applyer_cid, worker_cid, begin_date, apply_time, finish_time, status) VALUES(?,?,?,?,?,?,?,?,?,?);', 
			[task_id++, 2, outorder_id, 'picking', applyer_cid, 0, '', '', '', '']);
	DB.insertApplyMessage(2, outorder_id);
	return outorder_id;
};

DB.updateCheckoutOrder = function(outorder, newStatus, statusComment, transCompany, transNum, transDeliTime, transArriTime, pickingCid, $pickingTrs) {
	newStatus = parseInt(newStatus);
	pickingCid = parseInt(pickingCid);	

	try {		
		var orderstatushistory_id = alasql('select MAX(id) as id from orderstatushistory;')[0].id + 1;
		orderstatushistory_id = orderstatushistory_id ? orderstatushistory_id : 1;
	} catch(e) {
		var orderstatushistory_id = 1;
	}
	try {
		var pick_id = alasql('select MAX(id) as id from pick;')[0].id + 1;
		pick_id = pick_id ? pick_id : 1;
	} catch(e) {
		var pick_id = 1;
	}
	var date = parseDate(new Date());

	alasql('INSERT INTO orderstatushistory(id, order_id, order_type, who_cid, time, from_status, to_status, comment) value(?,?,?,?,?,?,?,?)',
		[orderstatushistory_id, outorder.id, 2, DB.getCid(), date, outorder.status, newStatus, statusComment]);
	alasql('UPDATE outorder SET status = ?, update_time = ? where id = ?;', [newStatus, date, outorder.id]);
	alasql('UPDATE transport SET company = ?, num = ?, delivery_date=?, arrival_date = ? where order_type = ? and order_id = ?;', [transCompany, transNum, transDeliTime, transArriTime, 2, outorder.id]);

	var pickingTask = alasql('SELECT * from task where order_type = ? and order_id = ? and task_name = ?;', [2, outorder.id, 'picking'])[0];
	if (pickingTask.worker_cid != pickingCid) {
		alasql('UPDATE task SET applyer_cid = ?, worker_cid = ?, apply_time = ?, status = ? where id = ?;', [DB.getCid(), pickingCid, date, 'Unfinished', pickingTask.id]);
		DB.insertTaskMessage(pickingCid, 2, outorder.id, 'picking');
	}	
	if (newStatus >= 5 && outorder.status <= 4) {
		alasql('UPDATE task SET finish_time = ?, status = ? where id = ?;', [date, 'Done', pickingTask.id]);
	}
	if (newStatus == 4) {
		DB.insertApproveMessage(2, outorder.id)
	}

	//place information
	if (outorder.status <= 4 && newStatus >= 5) {
		var orderitembatch_ids = alasql('select * from orderitembatch where order_type = ? and order_id = ?;', [2, outorder.id]).map(function(i){return i.id});
		alasql('delete from pick where orderitembatch_id in ('+orderitembatch_ids.map(function(i){return '?'}).join(',')+');', orderitembatch_ids);
		$pickingTrs.each(function(){
			var tr = $(this);
			var orderitembatch_id = parseInt(tr.find('select[name=nco-pick-itembatch]').val().split('-')[0]);		
			var place = alasql('select * from place where id = ?;', [parseInt(tr.find('select[name=nco-pick-place]').val())])[0];	
			alasql('INSERT INTO pick(id, orderitembatch_id, place, amount) VALUES(?,?,?,?);', [pick_id++, orderitembatch_id, place.place, parseInt(tr.find('input[name=nco-place-input]').val())]);		
		});
	}

	if (newStatus == 6) {
		var orderitembatchs = alasql('select orderitembatch.*, outorder.whouse_id, outorder.reason from orderitembatch left join outorder on orderitembatch.order_id = outorder.id\
		 					where orderitembatch.order_type = ? and orderitembatch.order_id = ?;', [2, outorder.id]);		
		orderitembatchs.forEach(function(i) {
			var stock = alasql('select * from stock where itembatch_id = ? and whouse_id = ?;', [i.itembatch_id, i.whouse_id])[0];
			if (stock === undefined) {
				try {
					var stock_id = alasql('select MAX(id) as id from stock;')[0].id+1;	
					stock_id = stock_id ? stock_id : 1;	
				} catch(e) {
					var stock_id = 1;
				}
				alasql('INSERT INTO stock(id, itembatch_id, whouse_id, balance, min_balance) VALUES(?,?,?,?,?);', [stock_id, i.itembatch_id, i.whouse_id, -i.balance, 0]);
			} else {
				alasql('UPDATE stock SET balance = ? where id = ?;', [stock.balance-i.balance, stock.id]);
			}
			DB.insertMinimumMessage(stock ? stock.id : stock_id);			

			var picks = alasql('select * from pick where orderitembatch_id = ?;', [i.id]);
			picks.forEach(function(p) {
				var place = alasql('select * from place where itembatch_id = ? and whouse_id = ? and place = ?;', [i.itembatch_id, i.whouse_id, p.place])[0];
				if (place === undefined) {
					console.log('error: could not found place. Impossible!!');
					try {
						var place_id = alasql('select MAX(id) as id from place;')[0].id+1;
						place_id = place_id ? place_id : 1;
					} catch(e) {
						var place_id = 1;
					}
					alasql('INSERT INTO place(id, itembatch_id, whouse_id, balance, place) VALUES(?,?,?,?,?);', [place_id, i.itembatch_id, i.whouse_id, -p.amount, p.place]);
				} else {
					alasql('UPDATE place SET balance = ? where id = ?;', [place.balance-p.amount, place.id]);
				}
			});
			
			try {
				var trans_id = alasql('select MAX(id) as id from trans;')[0].id+1;	
				trans_id = trans_id ? trans_id : 1;
			} catch(e) {
				var trans_id = 1;
			}
			alasql('INSERT INTO trans(id, stock_id, date, qty, balance, memo, order_type, order_id) VALUES(?,?,?,?,?,?,?,?);', [trans_id, stock ? stock.id : stock_id, date, -i.balance, stock ? stock.balance-i.balance : -i.balance, outorder.reason ? outorder.reason : '', 2, outorder.id]);
		});
	}
}

DB.listTransfer = function() {
	var list_transfer_sql = 'SELECT transferorder.*, i_w.code as whouse_in_code, i_w.name as whouse_in_name, o_w.code as whouse_out_code, o_w.name as whouse_out_name, e.name as applyer_c_name \
					from transferorder\
					left join whouse as o_w on 	transferorder.whouse_out_id = o_w.id\
					left join whouse as i_w on 	transferorder.whouse_in_id = i_w.id\
					left join emp as e on 		e.id = transferorder.applyer_cid;';
	var results = alasql(list_transfer_sql);
	return results;
}


DB.saveTransferOrder = function(applyer_cid, whouse_out_id, whouse_in_id, reason, comment, delivery_date, arrival_date, $trs) {
	applyer_cid = parseInt(applyer_cid);
	whouse_in_id = parseInt(whouse_in_id);
	whouse_out_id = parseInt(whouse_out_id);	
	try {
		var transferorder_id = alasql('select MAX(id) as id from transferorder;')[0].id + 1;	
		transferorder_id = transferorder_id ? transferorder_id : 1;	
	} catch(e) {
		var transferorder_id = 1;
	}
	try {	
		var orderitembatch_id = alasql('select MAX(id) as id from orderitembatch;')[0].id + 1;
		orderitembatch_id = orderitembatch_id ? orderitembatch_id : 1;
	} catch(e) {
		var orderitembatch_id = 1;
	}
	try {		
		var orderstatushistory_id = alasql('select MAX(id) as id from orderstatushistory;')[0].id + 1;
		orderstatushistory_id = orderstatushistory_id ? orderstatushistory_id : 1;
	} catch(e) {
		var orderstatushistory_id = 1;
	}
	try {		
		var transport_id = alasql('select MAX(id) as id from transport;')[0].id+1;
		transport_id = transport_id ? transport_id : 1;
	} catch(e) {
		var transport_id = 1;
	}
	try {
		var task_id = alasql('select MAX(id) as id from task;')[0].id+1;
		task_id = task_id ? task_id : 1;		
	} catch(e) {
		var task_id = 1;
	}

	var date = parseDate(new Date()); 
	alasql('INSERT INTO transferorder(id, applyer_cid, apply_time, update_time, status, reason, comment, whouse_out_id, whouse_in_id) VALUES(?,?,?,?,?,?,?,?,?);',
		[transferorder_id, applyer_cid, date, date, 1, reason, comment, whouse_out_id, whouse_in_id]);
	$trs.each(function(){
		var tr = $(this);
		var itembatch_id = parseInt(tr.find('select').val());
		var balance = parseInt(tr.find('input[name=balance]').val());
		alasql('INSERT INTO orderitembatch(id, order_id, order_type, itembatch_id, balance, actual_balance, place_in) VALUES(?,?,?,?,?,?,?);', 
			[orderitembatch_id++, transferorder_id, 3, itembatch_id, balance, balance, '']);
	});
	alasql('INSERT INTO orderstatushistory(id, order_id, order_type, who_cid, time, from_status, to_status, comment) value(?,?,?,?,?,?,?,?)',
		[orderstatushistory_id, transferorder_id, 3, applyer_cid, date, 0, 1, 'Created']);
	alasql('INSERT INTO transport(id, order_type, order_id, company, num, delivery_date, arrival_date) VALUES(?,?,?,?,?,?,?);', [transport_id, 3, transferorder_id, '', '', delivery_date, arrival_date]);
	alasql('INSERT INTO task(id, order_type, order_id, task_name, applyer_cid, worker_cid, begin_date) VALUES(?,?,?,?,?,?,?);', [task_id++, 3, transferorder_id, 'picking', applyer_cid, 0, '']);	
	alasql('INSERT INTO task(id, order_type, order_id, task_name, applyer_cid, worker_cid, begin_date, apply_time, finish_time, status) VALUES(?,?,?,?,?,?,?,?,?,?);', 
			[task_id++, 3, transferorder_id, 'inspection', applyer_cid, 0, '', '', '', '']);
	alasql('INSERT INTO task(id, order_type, order_id, task_name, applyer_cid, worker_cid, begin_date, apply_time, finish_time, status) VALUES(?,?,?,?,?,?,?,?,?,?);', 
			[task_id++, 3, transferorder_id, 'placing', applyer_cid, 0, '', '', '', '']);
	DB.insertApplyMessage(3, transferorder_id);
	return transferorder_id;
};


DB.updateTransferOrder = function(transferorder, newStatus, statusComment, transCompany, transNum, transDeliTime, transArriTime, pickingCid, inspectionCid, placingCid, $pickingTrs, $inspectionTrs, $placingTrs) {
	newStatus = parseInt(newStatus);
	pickingCid = parseInt(pickingCid);	
	inspectionCid = parseInt(inspectionCid);
	placingCid = parseInt(placingCid);		

	try {		
		var orderstatushistory_id = alasql('select MAX(id) as id from orderstatushistory;')[0].id + 1;
		orderstatushistory_id = orderstatushistory_id ? orderstatushistory_id : 1;
	} catch(e) {
		var orderstatushistory_id = 1;
	}
	try {
		var pick_id = alasql('select MAX(id) as id from pick;')[0].id + 1;
		pick_id = pick_id ? pick_id : 1;
	} catch(e) {
		var pick_id = 1;
	}
	var date = parseDate(new Date());

	alasql('INSERT INTO orderstatushistory(id, order_id, order_type, who_cid, time, from_status, to_status, comment) value(?,?,?,?,?,?,?,?)',
		[orderstatushistory_id, transferorder.id, 3, DB.getCid(), date, transferorder.status, newStatus, statusComment]);
	alasql('UPDATE transferorder SET status = ?, update_time = ? where id = ?;', [newStatus, date, transferorder.id]);
	alasql('UPDATE transport SET company = ?, num = ?, delivery_date=?, arrival_date = ? where order_type = ? and order_id = ?;', [transCompany, transNum, transDeliTime, transArriTime, 3, transferorder.id]);

	var pickingTask = alasql('SELECT * from task where order_type = ? and order_id = ? and task_name = ?;', [3, transferorder.id, 'picking'])[0];
	if (pickingTask.worker_cid != pickingCid) {
		alasql('UPDATE task SET applyer_cid = ?, worker_cid = ?, apply_time = ?, status = ? where id = ?;', [DB.getCid(), pickingCid, date, 'Unfinished', pickingTask.id]);
		DB.insertTaskMessage(pickingCid, 3, transferorder.id, 'picking');
	}
	if (newStatus >= 5 && transferorder.status <= 4) {
		alasql('UPDATE task SET finish_time = ?, status = ? where id = ?;', [date, 'Done', pickingTask.id]);
	}	

	var inspectionTask = alasql('SELECT * from task where order_type = ? and order_id = ? and task_name = ?;', [3, transferorder.id, 'inspection'])[0];
	if (inspectionTask.worker_cid != inspectionCid) {
		alasql('UPDATE task SET applyer_cid = ?, worker_cid = ?, apply_time = ?, status = ? where id = ?;', [DB.getCid(), inspectionCid, date, 'Unfinished', inspectionTask.id]);
		DB.insertTaskMessage(inspectionCid, 3, transferorder.id, 'inspection');
	}
	if (newStatus >= 8 && transferorder.status <= 7) {
		alasql('UPDATE task SET finish_time = ?, status = ? where id = ?;', [date, 'Done', inspectionTask.id]);
	}

	var placingTask	 = alasql('SELECT * from task where order_type = ? and order_id = ? and task_name = ?;', [3, transferorder.id, 'placing'])[0];	
	if (placingTask.worker_cid != placingCid) {
		alasql('UPDATE task SET applyer_cid = ?,worker_cid = ?, apply_time = ?, status = ? where id = ?;', [DB.getCid(), placingCid, date, 'Unfinished', placingTask.id]);
		DB.insertTaskMessage(placingCid, 3, transferorder.id, 'placing');
	}
	if (newStatus >= 9 && transferorder.status <= 8) {
		alasql('UPDATE task SET finish_time = ?, status = ? where id = ?;', [date, 'Done', placingTask.id]);
	}
	if (newStatus == 4) {
		DB.insertApproveMessage(3, transferorder.id)
	}

	//place
	if (transferorder.status <= 4 && newStatus >= 5) {
		var orderitembatch_ids = alasql('select * from orderitembatch where order_type = ? and order_id = ?;', [3, transferorder.id]).map(function(i){return i.id});
		alasql('delete from pick where orderitembatch_id in ('+orderitembatch_ids.map(function(i){return '?'}).join(',')+');', orderitembatch_ids);
		$pickingTrs.each(function(){
			var tr = $(this);
			var orderitembatch_id = parseInt(tr.find('select[name=nct-pick-itembatch]').val().split('-')[0]);				
			var place = alasql('select * from place where id = ?;', [parseInt(tr.find('select[name=nct-pick-place]').val())])[0];			
			alasql('INSERT INTO pick(id, orderitembatch_id, place, amount) VALUES(?,?,?,?);', [pick_id++, orderitembatch_id, place.place, parseInt(tr.find('input[name=nct-place-input]').val())]);		
		});
	}
	$inspectionTrs.each(function(){
		var tr = $(this);
		alasql('UPDATE orderitembatch SET actual_balance = ? where id = ? ;', [parseInt(tr.find('input[name=act-num]').val()), parseInt(tr.attr('pid'))]);			
	});
	$placingTrs.each(function(){
		var tr = $(this);
		alasql('UPDATE orderitembatch SET place_in = ? where id = ?;', [tr.find('input[name=place-input]').val(), parseInt(tr.attr('pid'))]);		
	});

	if (newStatus >= 6 && transferorder.status <= 5) {
		var orderitembatchs = alasql('select orderitembatch.*, transferorder.whouse_in_id, transferorder.whouse_out_id, transferorder.reason from orderitembatch\
									left join transferorder on orderitembatch.order_id = transferorder.id\
		 							where orderitembatch.order_type = ? and orderitembatch.order_id = ?;', [3, transferorder.id]);		
		orderitembatchs.forEach(function(i) {
			var stock = alasql('select * from stock where itembatch_id = ? and whouse_id = ?;', [i.itembatch_id, i.whouse_out_id])[0];
			if (stock === undefined) {
				try {
					var stock_id = alasql('select MAX(id) as id from stock;')[0].id+1;
					stock_id = stock_id ? stock_id : 1;	
				} catch(e) {
					var stock_id = 1;
				}
				alasql('INSERT INTO stock(id, itembatch_id, whouse_id, balance, min_balance) VALUES(?,?,?,?,?);', [stock_id, i.itembatch_id, i.whouse_out_id, -i.balance, 0]);
			} else {
				alasql('UPDATE stock SET balance = ? where id = ?;', [stock.balance-i.balance, stock.id]);
			}
			DB.insertMinimumMessage(stock ? stock.id : stock_id);			

			var picks = alasql('select * from pick where orderitembatch_id = ?;', [i.id]);
			picks.forEach(function(p) {
				var place = alasql('select * from place where itembatch_id = ? and whouse_id = ? and place = ?;', [i.itembatch_id, i.whouse_out_id, p.place])[0];
				if (place === undefined) {
					console.log('error: could not found place. Impossible!!');
					try {
						var place_id = alasql('select MAX(id) as id from place;')[0].id+1;
						place_id = place_id ? place_id : 1;
					} catch(e) {
						var place_id = 1;
					}
					alasql('INSERT INTO place(id, itembatch_id, whouse_id, balance, place) VALUES(?,?,?,?,?);', [place_id, i.itembatch_id, i.whouse_out_id, -p.amount, p.place]);
				} else {
					alasql('UPDATE place SET balance = ? where id = ?;', [place.balance-p.amount, place.id]);
				}
			});			

			try {
				var trans_id = alasql('select MAX(id) as id from trans;')[0].id+1;	
				trans_id = trans_id ? trans_id : 1;
			} catch(e) {
				var trans_id = 1;
			}
			alasql('INSERT INTO trans(id, stock_id, date, qty, balance, memo, order_type, order_id) VALUES(?,?,?,?,?,?,?,?);', [trans_id, stock ? stock.id : stock_id, date, -i.balance, stock ? stock.balance-i.balance : -i.balance, transferorder.reason ? transferorder.reason : '', 3, transferorder.id]);
		});
	}
	if (newStatus == 9) {
		var orderitembatchs = alasql('select orderitembatch.*, transferorder.whouse_in_id, transferorder.whouse_out_id, transferorder.reason from orderitembatch\
									left join transferorder on orderitembatch.order_id = transferorder.id\
		 							where orderitembatch.order_type = ? and orderitembatch.order_id = ?;', [3, transferorder.id]);		
		orderitembatchs.forEach(function(i) {
			var stock = alasql('select * from stock where itembatch_id = ? and whouse_id = ?;', [i.itembatch_id, i.whouse_in_id])[0];
			if (stock === undefined) {
				try {
					var stock_id = alasql('select MAX(id) as id from stock;')[0].id+1;
					stock_id = stock_id ? stock_id : 1;	
				} catch(e) {
					var stock_id = 1;
				}
				alasql('INSERT INTO stock(id, itembatch_id, whouse_id, balance, min_balance) VALUES(?,?,?,?,?);', [stock_id, i.itembatch_id, i.whouse_in_id, i.actual_balance,0]);
			} else {
				alasql('UPDATE stock SET balance = ? where id = ?;', [stock.balance+i.actual_balance, stock.id]);
			}

			var place = alasql('select * from place where itembatch_id = ? and whouse_id = ? and place = ?;', [i.itembatch_id, i.whouse_in_id, i.place_in])[0];
			if (place === undefined) {
				try {
					var place_id = alasql('select MAX(id) as id from place;')[0].id+1;
					place_id = place_id ? place_id : 1;
				} catch(e) {
					var place_id = 1;
				}
				alasql('INSERT INTO place(id, itembatch_id, whouse_id, balance, place) VALUES(?,?,?,?,?);', [place_id, i.itembatch_id, i.whouse_in_id, i.actual_balance, i.place_in]);
			} else {
				alasql('UPDATE place SET balance = ? where id = ?;', [place.balance+i.actual_balance, place.id]);
			}			

			try {
				var trans_id = alasql('select MAX(id) as id from trans;')[0].id+1;
				trans_id = trans_id ? trans_id : 1;
			} catch(e) {
				var trans_id = 1;
			}
			alasql('INSERT INTO trans(id, stock_id, date, qty, balance, memo, order_type, order_id) VALUES(?,?,?,?,?,?,?,?);', [trans_id, stock ? stock.id : stock_id, date, i.actual_balance, stock ? stock.balance+i.actual_balance : i.actual_balance, transferorder.reason ? transferorder.reason : '', 3, transferorder.id]);
		});
	}
}

DB.addWhouse = function(name, code, addr, tel) {
	try {
		var whouse_id = alasql('select MAX(id) as id from whouse;')[0].id+1;
		whouse_id = whouse_id ? whouse_id : 1;
	} catch(e) {
		var whouse_id = 1;
	}
	alasql('INSERT INTO whouse(id, code, name, addr, tel) VALUES(?,?,?,?,?)',
		[whouse_id, code, name, addr, tel]);
	return alasql('select * from whouse where id = ?;', [whouse_id])[0];
}

DB.addKind = function(text) {
	var kind = alasql('select * from kind where text = ?;', [text])[0];
	if(kind) {
		return kind;
	}
	try {
		var kind_id = alasql('select MAX(id) as id from kind;')[0].id+1;
		kind_id = kind_id ? kind_id : 1;
	} catch(e) {
		var kind_id = 1;
	}
	alasql('insert into kind(id, text) VALUES(?,?);', [kind_id, text]);
	return alasql('select * from kind where id = ?;', [kind_id])[0];
}

DB.addItem = function(detail, code, kind_id, maker, unit, comment) {
	try {
		var item_id = alasql('select MAX(id) as id from item;')[0].id+1;
		item_id = item_id ? item_id : 1;
	} catch(e) {
		var item_id = 1;
	}
	alasql('insert into item(id, code, kind_id, detail, comment, maker, unit) values(?,?,?,?,?,?,?)',
		[item_id, code, kind_id, detail, comment, maker, unit]);
	return alasql('select * from item where id = ?;', [item_id])[0];
}

DB.addItembatch = function(item_id, lot, expiration_date, deadline_date, cost, cost_unit, description) {
	try {
		var itembatch_id = alasql('select MAX(id) as id from itembatch;')[0].id+1;
		itembatch_id = itembatch_id ? itembatch_id : 1;
	} catch(e) {
		var itembatch_id = 1;
	}
	alasql('insert into itembatch(id, item_id, lot, expiration_date, description, deadline_date, cost, cost_unit) values(?,?,?,?,?,?,?,?)',
		[itembatch_id, item_id, lot, expiration_date, description, deadline_date, isNaN(cost)?0:cost,	cost_unit]);
	return alasql('select * from itembatch where id = ?;', [itembatch_id])[0];
}

DB.addEmp = function(name, emp_num, gender, title, tel, email, emp_whouses) {
	title = parseInt(title);
	try {
		var emp_id = alasql('select MAX(id) as id from emp;')[0].id+1;
		emp_id = emp_id ? emp_id : 1;
	} catch(e) {
		var emp_id = 1;
	}
	try {
		var emp_whouse_id = alasql('select MAX(id) as id from emp_whouse;')[0].id+1;
		emp_whouse_id = emp_whouse_id ? emp_whouse_id : 1;
	} catch(e) {
		var emp_whouse_id = 1;
	}
	alasql('insert into emp(id, emp_num, name, gender, tel, email, title, isActive) VALUES(?,?,?,?,?,?,?,?);',
		[emp_id, emp_num, name, parseInt(gender), tel, email, title, 1]);
	if (emp_whouses && (title == 4 || title == 5)) {
		emp_whouses.forEach(function(i){
			alasql('insert into emp_whouse(id, emp_id, whouse_id) VALUES(?,?,?);', [emp_whouse_id++, emp_id, parseInt(i)]);
		});
	}

	return alasql('select * from emp where id = ?;', [emp_id])[0];
}

DB.addPartner = function(company, name, emp_num, gender, title, tel, email) {
	try {
		var partner_id = alasql('select MAX(id) as id from partner;')[0].id+1;
		partner_id = partner_id ? partner_id : 1;
	} catch(e) {
		var partner_id = 1;
	}
	alasql('insert into partner(id, emp_num, name, gender, tel, email, title, company, isActive) VALUES(?,?,?,?,?,?,?,?,?);',
		[partner_id, emp_num, name, parseInt(gender), tel, email, title, company, 1]);
	return alasql('select * from partner where id = ?', [partner_id])[0];
}


// add commas to number
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

DB.getAllDataFromTable = function(tbname) {
	return alasql('select * from [' + tbname + '];');
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	var tableArr = 	   ['kind','item','itembatch','whouse','stock', 
						'trans','partner','emp','tem_contact','inorder', 
						'outorder','transferorder','orderitembatch','orderstatushistory','transport', 
						'emp_whouse','task','user','place','pick',
						'message','setting'];
	for (var i=0; i<tableArr.length; i++) {
		var table_t = tableArr[i];
		alasql('select * from '+table_t);
	}
	DB.loadFinish = true;
} catch (e) {
	try {
		alasql('CREATE localStorage DATABASE STK;');
	} catch(e) {
		//
	}	
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
