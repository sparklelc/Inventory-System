;$(function() {		
	var currentPageName = '';
	var stockPage = {}; //page->pageName
	var funcBar_page = {};
	var isFunctionBarShown = true;
	var setting = DB.getSetting();
	var historyBackObj = Object.create(null);	

	function init() {
		console.log('reload whole page');
		$('body').hide();
		$('#nav-home,#nav-user,#openFuncBar,#functionbar').addClass('tem-hide');	
		
		initHTML();
		initFunctionBar();
		initHistory();

		setInterval(function(){$.get('index.html').done(function(data){;}).fail(function(e){;});}, 5000);
	};

	function initHTML() {		
		$('#homepage-btn').off('click').on('click', function() {
			openPage('home', false, false);
		});	
		$('#index-logout').off('click').on('click', function(){
			document.cookie="uid=";
			openPage('login', false, false);
		});	
	};

	function initSortTable(initTables, reInitFunc) { //table[stype*=s], th[sdt=] | th[scn=], tr[scn=&sv=]
		var tables = initTables ? $(initTables) : $('table[stype*=s]');		
		for (var i=0; i<tables.length; i++) {			
			var t = tables.eq(i);
			t.find('thead tr th').children('span.glyphicon-sort-by-attributes-alt,span.glyphicon-sort-by-attributes').remove();
			t.find('thead tr th').css('cursor', 'pointer');

			t.find('tr th').off('click');
			t.find('tr th').on('click', function() {
				$('#loading').show();
				$(this).parent('tr').children('th').children('span.glyphicon-sort-by-attributes-alt,span.glyphicon-sort-by-attributes').remove();
				if ($(this).attr('sasc') == 'asc') {
					$(this).attr('sasc', 'desc');
					$(this).append(' <span class="glyphicon glyphicon-sort-by-attributes-alt c5"></span>')					
				} else if ($(this).attr('sasc') == 'desc'){
					$(this).attr('sasc', 'asc');
					$(this).append(' <span class="glyphicon glyphicon-sort-by-attributes c5"></span>')
				} else {
					$(this).attr('sasc', 'asc');
					$(this).append(' <span class="glyphicon glyphicon-sort-by-attributes c5"></span>')
				}
				var colName = $(this).attr('scn');
				var colIndex = $(this).prevAll('th').length;
				var dataType = $(this).attr('sdt');
				var sortFunc = function() {return 0;};
				switch(dataType){
					case 'number':
						sortFunc = function(a, b) {							
							if (!a && !b) return 0;
							if (!a) return -1;
							if (!b) return 1;
							return parseFloat(a) > parseFloat(b) ? 1 : (parseFloat(a) == parseFloat(b) ? 0 : -1);
						};
						break;
					case 'longstring':
					case 'string':
						sortFunc = function(a, b) {
							if (!a && !b) return 0;
							if (!a) return -1;
							if (!b) return 1;

							for(var i=0; i<a.length && i<b.length; i++) {
								if (a[i] > b[i])
									return 1;
								else if (a[i] < b[i])
									return -1;								
							}
							return a.length > b.length ? 1 : (a.length == b.length ? 0 : -1);
						};
						break;
					default: //date
						sortFunc = function(a, b) {
							if (!a && !b) return 0;
							if (!a) return -1;
							if (!b) return 1;

							return a > b ? 1 : (a == b ? 0 : -1);
						};
				}							

				var table = $(this).parent('tr').parent('thead').parent('table');
				var rowsLength = table.find('tr').length;
				var arr = [];
				var strArr = [];
				for (var j=0; j<rowsLength; j++) {
					var tr = table.find('tr').eq(j);
					strArr.push(tr.prop('outerHTML'));
					var value = tr.find('td').eq(colIndex).attr('sv');
					arr.push(value ? value : tr.find('td').eq(colIndex).text());
				}

				for (var j=1; j<rowsLength; j++) {
					for (var k=rowsLength-1; k>=j+1; k--) {
						var bValue = arr[k];
						var sValue = arr[k-1];
						if (($(this).attr('sasc') == 'asc' && sortFunc(bValue, sValue) < 0) ||
							($(this).attr('sasc') == 'desc' && sortFunc(bValue, sValue) > 0)) {							
							//sRow.before(bRow.prop('outerHTML'));
							//bRow.remove();
							var tem = arr[k];
							arr[k] = arr[k-1];
							arr[k-1] = tem;
							tem = strArr[k];
							strArr[k] = strArr[k-1];
							strArr[k-1] = tem;
						}
					}
				}
				strArr.shift();
				table.find('tbody').empty().append(strArr.join(''));
				
				reInitFunc === null || reInitFunc === undefined ? null : reInitFunc();
				$('#loading').hide();
			});
		}
	};

	function openFilterTable(selec) {
		$(selec).find('thead>tr>th span[class*=glyphicon-filter]').remove();
		$(selec).find('thead>tr>th').prepend('<span class="glyphicon glyphicon-filter column-drop-filter"></span>');
		initFilterTable(selec);
	};

	function closeFilterTable(selec) {
		$(selec).find('thead>tr>th span[class*=glyphicon-filter]').not('[class*=column-drop-filter-active]').remove();
		var activeHrs = $(selec).find('thead>tr>th span[class*=glyphicon-filter]').toArray().forEach(function(s){
			var th = $(s).parent('th').eq(0);
			$(s).remove();
			th.prepend('<span class="glyphicon glyphicon-filter column-drop-filter column-drop-filter-active" type="button" data-toggle="tooltip"\
					 data-placement="bottom" title="Under specific search conditions, click the \'Search and Filter Data\' button to edit filter conditions."></span>');
		});
		tooltip();
	};

	function initFilterTable(selec) { //table[stype*=f][class*=ft], th[sdt=] | tr[sv=] | th[sfc?=]
		var tables = selec ? $(selec) : $('table[stype*=f]');		
		for (var i=0; i<tables.length; i++) {
			var t = tables.eq(i);
			t.find('thead tr th').css('cursor', 'pointer');
			t.find('thead>tr>th').each(function() {
				if ($(this).children('ul').length != 0)
					showFilteredCol($(this));}
			);

			t.find('tr th .glyphicon-filter').off('click');
			t.find('tr th .glyphicon-filter').on('click', function(e) {
				e.stopPropagation();
				if ($('#toolkit2').prop('active') == 'false') return;
				var th = $(this).parent('th');
				var dataType = th.attr('sdt');
				var colIndex = th.prevAll('th').length;
				var table = th.parent('tr').parent('thead').parent('table');
				table.find('ul[stype*=f]').hide();

				if (th.find('ul[stype*=f]').length == 0) {
					var ulStr = '<ul stype="f" class="column-drop"><li>Keyword:</li><li><input type="search" class="form-control" placeholder="Keyword Search"></li>\
								<li class="divider" role="separator"></li>';
					if (dataType == 'number' || dataType == 'date' || dataType == 'datetime') {
						ulStr += '<li>From:</li><li><input type="'+dataType+'" class="form-control" placeholder="Minimum Value" name="min"></li>\
								<li>To:</li><li><input type="'+dataType+'" class="form-control" placeholder="Maximum Value" name="max"></li>\
								<li class="divider" role="separator"></li>';
					}
					if (dataType != 'longstring' && dataType != 'number' && dataType != 'date'  && dataType != 'datetime') {
						var arr = [];
						$(table).find('tbody tr').toArray().map(function(tr){
							var td = $(tr).find('td').eq(colIndex);
							var value = td.attr('sv') ? td.attr('sv') : td.text();
							if ($.inArray(value, arr) == -1) {
								arr.push(value);
							}
						});						
						dataType == 'number' ? arr.sort(function(a, b){return parseFloat(a)-parseFloat(b);}) : arr.sort();
						arr = arr.map(function(t){return '<option value="' + t + '">' + t + '</option>'});
						ulStr += '<li>Options:</li><li><select class="form-control" multiple="multiple">' + arr.join('') + '</select></li>'
					}
					ulStr += '<span class="column-drop-close">×</span><button class="btn btn-sm column-drop-clear-btn">Clear these Conditions</button></ul>';
					var ul = $(ulStr);

					ul.on('click', function(e){
						e.stopPropagation();
					}).css('cursor', 'auto');
					ul.find('[class*=column-drop-close]').on('click', function(e){
						e.stopPropagation();
						$(this).parent('ul').hide();
					});
					ul.find('button[class*=column-drop-clear-btn]').on('click', function() {
						ul.find('input[type=search]').val('').trigger('input');
						ul.find('input[name=min]').val('').trigger('input');
						ul.find('input[name=max]').val('').trigger('input');
						ul.find('select').val('').trigger('change');
					});
					$(document).on('click', function() {						
						$('table[stype*=f]').find('thead>tr>th>ul').hide();
					});		
					if (($(document).width() - th.offset().left < th.offset().left) && 
						th.offset().left > 230) {
						ul.addClass('show-left');
					}					

					ul.find('input[type=search]').on('input', function(){
						var th = $(this).parents('th').eq(0);
						var colIndex = th.prevAll('th').length;
						var dataType = th.attr('sdt');
						var table = th.parent('tr').parent('thead').parent('table');
						var value = $(this).val().trim();

						table.find('tbody>tr').toArray().forEach(function(tr){
							td = $(tr).children('td').eq(colIndex);
							// meet keyword
							if (td.text().toLowerCase().indexOf(value.toLowerCase()) != -1 || 
							   (td.attr('sv') && td.attr('sv').toLowerCase().indexOf(value.toLowerCase()) != -1)) {
								if (td.parent('tr').attr('sfc1') && td.parent('tr').attr('sfc1').indexOf('-'+colIndex) != -1) {
									td.parent('tr').attr('sfc1', td.parent('tr').attr('sfc1').split('-'+colIndex).join(''));									
								}	
							// miss keyword
							} else {
								if (!td.parent('tr').attr('sfc1')) {
									td.parent('tr').attr('sfc1', '-'+colIndex);
								} else if (td.parent('tr').attr('sfc1').indexOf('-'+colIndex) == -1) {
									td.parent('tr').attr('sfc1', td.parent('tr').attr('sfc1')+'-'+colIndex);
								}
							}
							showFilteredTr(td);						
						});
						showFilteredCol(th);
					});
					ul.find('input[name=min],input[name=max]').on('input', function(){
						var dataType = $(this).attr('type');
						var mvalue = $(this).val();
						mvalue = dataType == 'number' ? parseFloat(mvalue) : mvalue;
						var mname = $(this).attr('name');
						var th = $(this).parents('th').eq(0);
						var colIndex = th.prevAll('th').length;
						var table = th.parent('tr').parent('thead').parent('table');
						
						table.find('tbody>tr').toArray().forEach(function(tr){
							td = $(tr).children('td').eq(colIndex);
							var value = td.attr('sv') ? td.attr('sv') : td.text();
							value = dataType == 'number' ? parseFloat(value) : value;
							if (dataType == 'number') {
								if (mname == "min") {
									if (isNaN(mvalue) || mvalue === "" || mvalue === undefined || mvalue === null || mvalue <= value) {
										if (td.parent('tr').attr('sfc2') && td.parent('tr').attr('sfc2').indexOf('-i'+colIndex) != -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2').split('-i'+colIndex).join(''));
										}
									} else {
										if (!td.parent('tr').attr('sfc2')) {
											td.parent('tr').attr('sfc2', '-i'+colIndex);
										} else if (td.parent('tr').attr('sfc2').indexOf('-i'+colIndex) == -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2')+'-i'+colIndex);
										}
									}
								} else {
									if (isNaN(mvalue) || mvalue === "" || mvalue === undefined || mvalue === null || mvalue >= value) {
										if (td.parent('tr').attr('sfc2') && td.parent('tr').attr('sfc2').indexOf('-a'+colIndex) != -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2').split('-a'+colIndex).join(''));
										}
									} else {
										if (!td.parent('tr').attr('sfc2')) {
											td.parent('tr').attr('sfc2', '-a'+colIndex);
										} else if (td.parent('tr').attr('sfc2').indexOf('-a'+colIndex) == -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2')+'-a'+colIndex);
										}
									}
								}
							} else {
								if (mname == "min") {
									if (mvalue === "" || mvalue === undefined || mvalue === null || mvalue <= value) {
										if (td.parent('tr').attr('sfc2') && td.parent('tr').attr('sfc2').indexOf('-i'+colIndex) != -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2').split('-i'+colIndex).join(''));
										}
									} else {
										if (!td.parent('tr').attr('sfc2')) {
											td.parent('tr').attr('sfc2', '-i'+colIndex);
										} else if (td.parent('tr').attr('sfc2').indexOf('-i'+colIndex) == -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2')+'-i'+colIndex);
										}
									}
								} else {
									if (mvalue === "" || mvalue === undefined || mvalue === null || mvalue >= value) {
										if (td.parent('tr').attr('sfc2') && td.parent('tr').attr('sfc2').indexOf('-a'+colIndex) != -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2').split('-a'+colIndex).join(''));
										}
									} else {
										if (!td.parent('tr').attr('sfc2')) {
											td.parent('tr').attr('sfc2', '-a'+colIndex);
										} else if (td.parent('tr').attr('sfc2').indexOf('-a'+colIndex) == -1) {
											td.parent('tr').attr('sfc2', td.parent('tr').attr('sfc2')+'-a'+colIndex);
										}
									}
								}
							}
							showFilteredTr(td);
						});
						showFilteredCol(th);
					});
					ul.find('select').on('change', function(){
						var th = $(this).parents('th').eq(0);
						var colIndex = th.prevAll('th').length;
						var table = th.parent('tr').parent('thead').parent('table');
						var svalueArr = $(this).val();					

						table.find('tbody>tr').toArray().forEach(function(tr){
							td = $(tr).children('td').eq(colIndex);
							// meet options
							if (svalueArr === null || $.inArray(td.text(), svalueArr) != -1 || 
							   (td.attr('sv') && $.inArray(td.attr('sv'), svalueArr) != -1)) {
								if (td.parent('tr').attr('sfc3') && td.parent('tr').attr('sfc3').indexOf('-'+colIndex) != -1) {
									td.parent('tr').attr('sfc3', td.parent('tr').attr('sfc3').split('-'+colIndex).join(''));
								}	
							// miss options
							} else {
								if (!td.parent('tr').attr('sfc3')) {
									td.parent('tr').attr('sfc3', '-'+colIndex);
								} else if (td.parent('tr').attr('sfc3').indexOf('-'+colIndex) == -1) {
									td.parent('tr').attr('sfc3', td.parent('tr').attr('sfc3')+'-'+colIndex);
								}
							}
							showFilteredTr(td);						
						});
						showFilteredCol(th);
					});		
					ul.appendTo(th);						
				} else {
					th.find('ul[stype*=f]').show();
				}
			});

			function showFilteredTr(td) {
				if ((td.parent('tr').attr('sfc1') && td.parent('tr').attr('sfc1').length != 0) || 
					(td.parent('tr').attr('sfc2') && td.parent('tr').attr('sfc2').length != 0) ||
					(td.parent('tr').attr('sfc3') && td.parent('tr').attr('sfc3').length != 0)) {
					td.parent('tr').hide();
				} else {
					td.parent('tr').show();
				}
			};

			function showFilteredCol(th) {
				if (th.find('ul input[type=search]').val().trim().length != 0 ||
					(th.find('ul input[name=min]').val() && (th.find('ul input[name=min]').val() + '').length != 0) ||
					(th.find('ul input[name=min]').val() && (th.find('ul input[name=max]').val() + '').length != 0) ||
					(th.find('ul select').val() && th.find('ul select').val().length != 0)) {
					th.find('span.column-drop-filter').addClass('column-drop-filter-active');
				} else {
					th.find('span.column-drop-filter').removeClass('column-drop-filter-active');
				}						
			};
		}
	};	

	function initFixedTable(selec) {
		var tables = selec ? $(selec) : $('table[stype*=x]');		
		for (var i=0; i<tables.length; i++) {
			var t = tables.eq(i);
			t.css('width', '');
			t.find('thead>tr>th').css('width', '');
			t.find('thead>tr>th').prepend('<span class="glyphicon glyphicon-filter column-drop-filter"></span>').
									append('<span class="glyphicon glyphicon-sort-by-attributes c5"></span>');
			t.find('thead>tr>th').toArray().forEach(function(th) {
				th = $(th);
				th.css('width', th.width());
			});
			t.find('thead>tr>th span').remove();
		}
	};

	function initHistory() {
		//open new or refresh
		if (window.history.state === null) { //open	new tab	
			if(DB.getUser()) {
				openPage('home', true, false);
			} else {
				openPage('login', true, false);
			}					
		} else { //refresh
			openPage(window.history.state, true, false);
		}

		//backward or forward
		$(window).on('popstate', function(e){
			openPage(e.originalEvent.state, false, true);
		});
	};

	function addHistory(pageName, isFirst) {
		if (isFirst) {
			window.history.replaceState(pageName, null, null);
		} else {
			window.history.pushState(pageName, null, null);
		}					
	};

	function toggleFunctionBar(close, notShowAnim) {
		if (close) {
			$('div[name=mainbody]').addClass('main-body-larger');
			if (!notShowAnim) {
				$('div[name=mainbody]').addClass('main-body-larger-anim');
			}
			$('#functionbar').hide().removeClass('functionbar-show');
			$('#openFuncBar').removeClass('active');
			$('#openFuncBar .glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
			isFunctionBarShown = false;
		} else {
			$('div[name=mainbody]').removeClass('main-body-larger').removeClass('main-body-larger-anim');
			$('#functionbar').show();
			if (!notShowAnim) {
				$('#functionbar').addClass('functionbar-show');
			}
			$('#openFuncBar').addClass('active');
			$('#openFuncBar .glyphicon-chevron-down').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
			isFunctionBarShown = true;
		}
	};

	function initFunctionBar() {		
		$('#close-functionbar-btn').on('click', function() {
			toggleFunctionBar(true);
			isFunctionBarShown = false;
		});

		$('#openFuncBar').on('click', function() {
			isFunctionBarShown ? toggleFunctionBar(true) : toggleFunctionBar(false);
		});

		$('#f1-checkin').off('click').on('click', function() {			
			openPage('check-in', false, false);
		});
		$('#f1-checkout').off('click').on('click', function() {			
			openPage('check-out', false, false);
		});
		$('#f1-transfer').off('click').on('click', function() {			
			openPage('transfer', false, false);
		});
		$('#f2-liststock').off('click').on('click', function() {			
			openPage('list-stock', false, false);
		});
		$('#f2-prediction').off('click').on('click', function() {			
			openPage('list-prediction', false, false);
		});
		$('#f2-alert').off('click').on('click', function() {			
			openPage('list-alert', false, false);
		});
		$('#f3-whouse').off('click').on('click', function() {			
			openPage('list-whouse', false, false);
		});
		$('#f3-item').off('click').on('click', function() {			
			openPage('list-item', false, false);
		});
		$('#f3-contact').off('click').on('click', function() {			
			openPage('list-contact', false, false);
		});
		$('#f4-setting').off('click').on('click', function() {			
			openPage('setting', false, false);
		});
		
		$('[id*=toolkit-b-]').removeClass('hide');
		$('#toolkit-b-1').hide();
		$('#toolkit-b-2').hide();
		$('#toolkit-b-3').hide();
		tooltip();
	};	

	function customFunctionBar(pageName, page, couldBack, obj) {
		$('#functionbar').find('div[class*=bc]').removeClass('bc-a-f');
		
		switch(page) {
			case 'list-stock':
				$('#toolkit-b-1').show().css('cursor', 'auto').removeClass('big-block-enable'); $('#toolkit-b-2').show(); $('#toolkit-b-3').hide();
				$('#toolkit1').show();
				$('#toolkit2').show().attr('title', '').attr('data-original-title', 'Search and Filter Data').find('span').removeClass().addClass('glyphicon glyphicon-search');
				$('#toolkit3').hide();
				$('#toolkit4').hide();
				$('#toolkit1').off('click').on('click', function() {
					if ($(this).prop('disabled') !== 'true') {
						openPage(currentPageName, true, false);
						$('div[name=mainbody]:visible').scrollTop(0);
					}
				});
				$('#toolkit2').off('click').on('click', toggleSearchMode_liststock);

				if (couldBack && funcBar_page[page] && funcBar_page[page]['pageName'] == pageName && funcBar_page[page]['status'] == 1) {
					toggleSearchMode_liststock(null, 1);
				} else {
					funcBar_page[page] = {};
					funcBar_page[page]['status'] = 0;
					funcBar_page[page]['pageName'] = pageName;
					toggleSearchMode_liststock(null, 0);
				}

				function toggleSearchMode_liststock(e, status) {
					if (status === 1 || (status === undefined && (!$('#toolkit2').prop('active') || $('#toolkit2').prop('active') == 'false'))) {
						openFilterTable('#list-stock-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Stop Search Mode and Back to View Mode').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
						$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
						$('#toolkit-b-1').off('click').on('click', toggleSearchMode_liststock);
						$('#toolkit1').attr('title', '').attr('data-original-title', 'Clear All Filter Conditions').find('span').removeClass().addClass('glyphicon glyphicon-remove-sign');
						$('#toolkit1').off('click').on('click', function() {
							var uls = $('table[stype*=f]').find('thead>tr>th>ul');
							uls.find('input[type=search]').val('').trigger('input');
							uls.find('input[name=min]').val('').trigger('input');
							uls.find('input[name=max]').val('').trigger('input');
							uls.find('select').val('').trigger('change');
							$('div[class*=global-search-bar-div]').find('input').val('').trigger('input');
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Finish Searching and Return').addClass('active-block');
						$('#toolkit2').addClass('bc-a').prop('active', 'true');	
						//addInfoMess('Guide for New User:', '<p>Change to "Search Mode", Click this button again could return to "View Mode".</p>', null, 90);
						$('#l-search-product').parent('div').removeClass('hide');						
						$('#l-search-product').off('input').on('input', function() {	
							var productbatchs = alasql(list_stock_sql);
							var value = $(this).val().trim();
							var results = fuzzySearch(productbatchs, ['name', 'text', 'maker', 'code', 'detail', 'lot', 'balance'], value);
							var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+p.code+' '+p.detail+' ('+p.maker+', '+p.text+') ('+p.name+', BATCH：'+p.lot+', AMOUNT：'+p.balance+')<span class="glyphicon"></span></li>'});
							$(this).nextAll('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));
							if(value.length == 0 || results.length == 0) {
								$(this).nextAll('ul[class*=recom-ul]').addClass('hide');
							}

							$(this).nextAll('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
								var id = $(this).attr('p-id');
								openPage('stock?id='+id, false, false);
							});
						});
						$('#l-search-product-close').off('click').on('click', function(){
							$('#l-search-product').val('').trigger('input');
						});
						funcBar_page[page]['status'] = 1;
					} else {
						closeFilterTable('#list-stock-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Operate').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-wrench');
						$('#toolkit-b-1').css('cursor', 'auto').removeClass('big-block-enable').find('span[class*=block-name]').text('Operate');
						$('#toolkit-b-1').off('click');
						$('#toolkit1').show().attr('title', 'Refresh Page').attr('data-original-title', 'Refresh Page').find('span').removeClass().addClass('glyphicon glyphicon-refresh');
						$('#toolkit1').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage(currentPageName, true, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Search and Filter Data').removeClass('active-block');
						$('#toolkit2').removeClass('bc-a').prop('active', 'false');

						$('#l-search-product').parent('div').addClass('hide');
						$('#l-search-product').val('').trigger('input');
						funcBar_page[page]['status'] = 0;
					}
					tooltip();
				}			
				$('#f2-liststock').addClass('bc-a-f');				
				break;



			case 'stock':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f2-liststock').addClass('bc-a-f');
				break;
				

			case 'check-in':
				$('#toolkit-b-1').show().css('cursor', 'auto').removeClass('big-block-enable'); $('#toolkit-b-2').show(); $('#toolkit-b-3').hide();
				$('#toolkit1').show();
				$('#toolkit2').show().attr('title', '').attr('data-original-title', 'Search and Filter Data').find('span').removeClass().addClass('glyphicon glyphicon-search');
				if (DB.getUserEmp().title <= 4) {
					$('#toolkit3').show().attr('title', '').attr('data-original-title', 'Create Check-in Application').find('span').removeClass().addClass('glyphicon glyphicon-import');
					$('#toolkit3').off('click').on('click', function() {
						if ($(this).prop('disabled') !== 'true') {
							openPage('check-in-order', false, false);
							$('div[name=mainbody]:visible').scrollTop(0);
						}
					});
				} else {
					$('#toolkit3').hide();
				}
				$('#toolkit4').hide();
				$('#toolkit1').off('click').on('click', function() {
					if ($(this).prop('disabled') !== 'true') {
						openPage(currentPageName, true, false);
						$('div[name=mainbody]:visible').scrollTop(0);
					}
				});
				$('#toolkit2').off('click').on('click', toggleSearchMode_checkin);
				
				if (couldBack && funcBar_page[page] && funcBar_page[page]['pageName'] == pageName && funcBar_page[page]['status'] == 1) {					
					toggleSearchMode_checkin(null, 1);
				} else {
					funcBar_page[page] = {};
					funcBar_page[page]['status'] = 0;
					funcBar_page[page]['pageName'] = pageName;
					toggleSearchMode_checkin(null, 0);
				}

				function toggleSearchMode_checkin(e, status) {
					if (status === 1 || (status === undefined && (!$('#toolkit2').prop('active') || $('#toolkit2').prop('active') == 'false'))) {
						openFilterTable('#list-checkin-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Stop Search Mode and Back to View Mode').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
						$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
						$('#toolkit-b-1').off('click').on('click', toggleSearchMode_checkin);
						$('#toolkit1').attr('title', '').attr('data-original-title', 'Clear All Filter Conditions').find('span').removeClass().addClass('glyphicon glyphicon-remove-sign');
						$('#toolkit1').off('click').on('click', function() {
							var uls = $('table[stype*=f]').find('thead>tr>th>ul');
							uls.find('input[type=search]').val('').trigger('input');
							uls.find('input[name=min]').val('').trigger('input');
							uls.find('input[name=max]').val('').trigger('input');
							uls.find('select').val('').trigger('change');
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Finish Searching and Return').addClass('active-block');
						$('#toolkit2').addClass('bc-a').prop('active', 'true');	
						$('#toolkit3').hide();
						
						$('#lci-search-product').parent('div').removeClass('hide');						
						$('#lci-search-product').off('input').on('input', function() {	
							var sql_results = DB.listCheckin();
							var value = $(this).val().trim();							
							var results = fuzzySearch(sql_results, ['id', 'applyer_c_name', 'apply_time', 'update_time', 'status', 'reason', 'comment', 'supplier_name', 'supplier_c_name', 'whouse_name', 'whouse_code'], value, null, {'status':{'removeOrigin':true,'func':function(num){return orderStatus(1, num);}}});
							var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+orderStatus(1, p.status)+'('+p.id+') ---'+' FROM('+p.supplier_name+', '+p.supplier_c_name+') TO('+p.whouse_name+') BY('+p.applyer_c_name+', '+p.apply_time+')<span class="glyphicon"></span></li>'});
							$(this).nextAll('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));
							if(value.length == 0 || results.length == 0) {
								$(this).nextAll('ul[class*=recom-ul]').addClass('hide');
							}

							$(this).nextAll('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
								var id = $(this).attr('p-id');
								openPage('check-in-order?id='+id, false, false);
							});
						});
						$('#lci-search-product-close').off('click').on('click', function(){
							$('#lci-search-product').val('').trigger('input');
						});
						funcBar_page[page]['status'] = 1;
					} else {
						closeFilterTable('#list-checkin-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Operate').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-wrench');
						$('#toolkit-b-1').css('cursor', 'auto').removeClass('big-block-enable').find('span[class*=block-name]').text('Operate');
						$('#toolkit-b-1').off('click');
						$('#toolkit1').show().attr('title', '').attr('data-original-title', 'Refresh Page').find('span').removeClass().addClass('glyphicon glyphicon-refresh');
						$('#toolkit1').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage(currentPageName, true, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Search and Filter Data').removeClass('active-block');
						$('#toolkit2').removeClass('bc-a').prop('active', 'false');
						if (DB.getUserEmp().title <= 4) {
							$('#toolkit3').show();
						}

						$('#lci-search-product').parent('div').addClass('hide');
						$('#lci-search-product').val('').trigger('input');
						funcBar_page[page]['status'] = 0;
					}
					tooltip();
				}
				$('#f1-checkin').addClass('bc-a-f');				
				break;


			case 'check-in-order':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f1-checkin').addClass('bc-a-f');
				$('#toolkit-b-2').show(); $('#toolkit1').show(); $('#toolkit2').hide(); $('#toolkit3').hide(); $('#toolkit4').hide();
				if (!obj.id) {					
					$('#toolkit1').attr('title', '').attr('data-original-title', 'Submit Check-in Application').find('span').removeClass().addClass('glyphicon glyphicon-floppy-disk');
					$('#toolkit1').off('click').on('click', function(){
						$('#nci-submit-inorder').filter(':visible').trigger('click');
					});
				} else {
					$('#toolkit1').attr('title', '').attr('data-original-title', 'Update Order Status').find('span').removeClass().addClass('glyphicon glyphicon-floppy-disk');
					$('#toolkit1').off('click').on('click', function(){
						$('#nci-update-inorder').filter(':visible').trigger('click');
					});
				}
				break;


			case 'check-out':
				$('#toolkit-b-1').show().css('cursor', 'auto').removeClass('big-block-enable'); $('#toolkit-b-2').show(); $('#toolkit-b-3').hide();
				$('#toolkit1').show();
				$('#toolkit2').show().attr('title', '').attr('data-original-title', 'Search and Filter Data').find('span').removeClass().addClass('glyphicon glyphicon-search');
				if (DB.getUserEmp().title <= 4) {
					$('#toolkit3').show().attr('title', '').attr('data-original-title', 'Create Check-out Application').find('span').removeClass().addClass('glyphicon glyphicon-import');
					$('#toolkit3').off('click').on('click', function() {
						if ($(this).prop('disabled') !== 'true') {
							openPage('check-out-order', false, false);
							$('div[name=mainbody]:visible').scrollTop(0);
						}
					});
				} else {
					$('#toolkit3').hide();
				}
				$('#toolkit4').hide();
				$('#toolkit1').off('click').on('click', function() {
					if ($(this).prop('disabled') !== 'true') {
						openPage(currentPageName, true, false);
						$('div[name=mainbody]:visible').scrollTop(0);
					}
				});
				$('#toolkit2').off('click').on('click', toggleSearchMode_checkout);
				
				if (couldBack && funcBar_page[page] && funcBar_page[page]['pageName'] == pageName && funcBar_page[page]['status'] == 1) {					
					toggleSearchMode_checkout(null, 1);
				} else {
					funcBar_page[page] = {};
					funcBar_page[page]['status'] = 0;
					funcBar_page[page]['pageName'] = pageName;
					toggleSearchMode_checkout(null, 0);
				}

				function toggleSearchMode_checkout(e, status) {
					if (status === 1 || (status === undefined && (!$('#toolkit2').prop('active') || $('#toolkit2').prop('active') == 'false'))) {
						openFilterTable('#list-checkout-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Stop Search Mode and Back to View Mode').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
						$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
						$('#toolkit-b-1').off('click').on('click', toggleSearchMode_checkout);
						$('#toolkit1').attr('title', '').attr('data-original-title', 'Clear All Filter Conditions').find('span').removeClass().addClass('glyphicon glyphicon-remove-sign');
						$('#toolkit1').off('click').on('click', function() {
							var uls = $('table[stype*=f]').find('thead>tr>th>ul');
							uls.find('input[type=search]').val('').trigger('input');
							uls.find('input[name=min]').val('').trigger('input');
							uls.find('input[name=max]').val('').trigger('input');
							uls.find('select').val('').trigger('change');
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Finish Searching and Return').addClass('active-block');
						$('#toolkit2').addClass('bc-a').prop('active', 'true');	
						$('#toolkit3').hide();
						
						$('#lco-search-product').parent('div').removeClass('hide');						
						$('#lco-search-product').off('input').on('input', function() {	
							var sql_results = DB.listCheckout();
							var value = $(this).val().trim();
							var results = fuzzySearch(sql_results, ['id', 'applyer_c_name', 'apply_time', 'update_time', 'status', 'reason', 'comment', 'buyer_name', 'buyer_c_name', 'whouse_name', 'whouse_code'], value, null, {'status':{'removeOrigin':true,'func':function(num){return orderStatus(2, num);}}});
							var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+orderStatus(2, p.status)+'('+p.id+') ---'+' FROM('+p.whouse_name+') TO('+p.buyer_name+', '+p.buyer_c_name+') BY('+p.applyer_c_name+', '+p.apply_time+')<span class="glyphicon"></span></li>'});
							$(this).nextAll('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));
							if(value.length == 0 || results.length == 0) {
								$(this).nextAll('ul[class*=recom-ul]').addClass('hide');
							}

							$(this).nextAll('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
								var id = $(this).attr('p-id');
								openPage('check-out-order?id='+id, false, false);
							});
						});
						$('#lco-search-product-close').off('click').on('click', function(){
							$('#lco-search-product').val('').trigger('input');
						});
						funcBar_page[page]['status'] = 1;
					} else {
						closeFilterTable('#list-checkout-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Operate').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-wrench');
						$('#toolkit-b-1').css('cursor', 'auto').removeClass('big-block-enable').find('span[class*=block-name]').text('Operate');
						$('#toolkit-b-1').off('click');
						$('#toolkit1').show().attr('title', '').attr('data-original-title', 'Refresh Page').find('span').removeClass().addClass('glyphicon glyphicon-refresh');
						$('#toolkit1').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage(currentPageName, true, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Search and Filter Data').removeClass('active-block');
						$('#toolkit2').removeClass('bc-a').prop('active', 'false');
						if (DB.getUserEmp().title <= 4) {
							$('#toolkit3').show();
						}

						$('#lco-search-product').parent('div').addClass('hide');
						$('#lco-search-product').val('').trigger('input');
						funcBar_page[page]['status'] = 0;
					}
					tooltip();
				}
				$('#f1-checkout').addClass('bc-a-f');				
				break;


			case 'check-out-order':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f1-checkout').addClass('bc-a-f');
				$('#toolkit-b-2').show(); $('#toolkit1').show(); $('#toolkit2').hide(); $('#toolkit3').hide(); $('#toolkit4').hide();
				if (!obj.id) {					
					$('#toolkit1').attr('title', '').attr('data-original-title', 'Submit Check-out Application').find('span').removeClass().addClass('glyphicon glyphicon-floppy-disk');
					$('#toolkit1').off('click').on('click', function(){
						$('#nco-submit-outorder').filter(':visible').trigger('click');
					});
				} else {
					$('#toolkit1').attr('title', '').attr('data-original-title', 'Update Order Status').find('span').removeClass().addClass('glyphicon glyphicon-floppy-disk');
					$('#toolkit1').off('click').on('click', function(){
						$('#nco-update-outorder').filter(':visible').trigger('click');
					});
				}
				break;




			case 'transfer':
				$('#toolkit-b-1').show().css('cursor', 'auto').removeClass('big-block-enable'); $('#toolkit-b-2').show(); $('#toolkit-b-3').hide();
				$('#toolkit1').show();
				$('#toolkit2').show().attr('title', '').attr('data-original-title', 'Search and Filter Data').find('span').removeClass().addClass('glyphicon glyphicon-search');
				if (DB.getUserEmp().title <= 4) {
					$('#toolkit3').show().attr('title', '').attr('data-original-title', 'Create Transfer Application').find('span').removeClass().addClass('glyphicon glyphicon-import');
					$('#toolkit3').off('click').on('click', function() {
						if ($(this).prop('disabled') !== 'true') {
							openPage('transfer-order', false, false);
							$('div[name=mainbody]:visible').scrollTop(0);
						}
					});
				} else {
					$('#toolkit3').hide();
				}
				$('#toolkit4').hide();
				$('#toolkit1').off('click').on('click', function() {
					if ($(this).prop('disabled') !== 'true') {
						openPage(currentPageName, true, false);
						$('div[name=mainbody]:visible').scrollTop(0);
					}
				});
				$('#toolkit2').off('click').on('click', toggleSearchMode_transfer);
				
				if (couldBack && funcBar_page[page] && funcBar_page[page]['pageName'] == pageName && funcBar_page[page]['status'] == 1) {					
					toggleSearchMode_transfer(null, 1);
				} else {
					funcBar_page[page] = {};
					funcBar_page[page]['status'] = 0;
					funcBar_page[page]['pageName'] = pageName;
					toggleSearchMode_transfer(null, 0);
				}

				function toggleSearchMode_transfer(e, status) {
					if (status === 1 || (status === undefined && (!$('#toolkit2').prop('active') || $('#toolkit2').prop('active') == 'false'))) {
						openFilterTable('#list-transfer-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Stop Search Mode and Back to View Mode').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
						$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
						$('#toolkit-b-1').off('click').on('click', toggleSearchMode_transfer);
						$('#toolkit1').attr('title', '').attr('data-original-title', 'Clear All Filter Conditions').find('span').removeClass().addClass('glyphicon glyphicon-remove-sign');
						$('#toolkit1').off('click').on('click', function() {
							var uls = $('table[stype*=f]').find('thead>tr>th>ul');
							uls.find('input[type=search]').val('').trigger('input');
							uls.find('input[name=min]').val('').trigger('input');
							uls.find('input[name=max]').val('').trigger('input');
							uls.find('select').val('').trigger('change');
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Finish Searching and Return').addClass('active-block');
						$('#toolkit2').addClass('bc-a').prop('active', 'true');	
						$('#toolkit3').hide();
						
						$('#lct-search-product').parent('div').removeClass('hide');						
						$('#lct-search-product').off('input').on('input', function() {	
							var sql_results = DB.listTransfer();
							var value = $(this).val().trim();
							var results = fuzzySearch(sql_results, ['id', 'applyer_c_name', 'apply_time', 'update_time', 'status', 'reason', 'comment', 'whouse_in_name', 'whouse_in_code', 'whouse_out_name', 'whouse_out_code'], value, null, {'status':{'removeOrigin':true,'func':function(num){return orderStatus(3, num);}}});
							var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+orderStatus(3, p.status)+'('+p.id+') ---'+' FROM('+p.whouse_out_name+') TO('+p.whouse_in_name+') BY('+p.applyer_c_name+', '+p.apply_time+')<span class="glyphicon"></span></li>'});
							$(this).nextAll('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));
							if(value.length == 0 || results.length == 0) {
								$(this).nextAll('ul[class*=recom-ul]').addClass('hide');
							}

							$(this).nextAll('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
								var id = $(this).attr('p-id');
								openPage('transfer-order?id='+id, false, false);
							});
						});
						$('#lct-search-product-close').off('click').on('click', function(){
							$('#lct-search-product').val('').trigger('input');
						});
						funcBar_page[page]['status'] = 1;
					} else {
						closeFilterTable('#list-transfer-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Operate').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-wrench');
						$('#toolkit-b-1').css('cursor', 'auto').removeClass('big-block-enable').find('span[class*=block-name]').text('Operate');
						$('#toolkit-b-1').off('click');
						$('#toolkit1').show().attr('title', '').attr('data-original-title', 'Refresh Page').find('span').removeClass().addClass('glyphicon glyphicon-refresh');
						$('#toolkit1').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage(currentPageName, true, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Search and Filter Data').removeClass('active-block');
						$('#toolkit2').removeClass('bc-a').prop('active', 'false');
						if (DB.getUserEmp().title <= 4) {
							$('#toolkit3').show();
						}

						$('#lct-search-product').parent('div').addClass('hide');
						$('#lct-search-product').val('').trigger('input');
						funcBar_page[page]['status'] = 0;
					}
					tooltip();
				}
				$('#f1-transfer').addClass('bc-a-f');				
				break;


			case 'transfer-order':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f1-transfer').addClass('bc-a-f');
				$('#toolkit-b-2').show(); $('#toolkit1').show(); $('#toolkit2').hide(); $('#toolkit3').hide(); $('#toolkit4').hide();
				if (!obj.id) {					
					$('#toolkit1').attr('title', '').attr('data-original-title', 'Submit Transfer Application').find('span').removeClass().addClass('glyphicon glyphicon-floppy-disk');
					$('#toolkit1').off('click').on('click', function(){
						$('#nct-submit-transferorder').filter(':visible').trigger('click');
					});
				} else {
					$('#toolkit1').attr('title', '').attr('data-original-title', 'Update Order Status').find('span').removeClass().addClass('glyphicon glyphicon-floppy-disk');
					$('#toolkit1').off('click').on('click', function(){
						$('#nct-update-transferorder').filter(':visible').trigger('click');
					});
				}
				break;



			case 'list-whouse':
			case 'list-item':
			case 'list-contact':
				var prefix = getPagePrefix(page);							
				$('#toolkit-b-1').show().css('cursor', 'auto').removeClass('big-block-enable'); $('#toolkit-b-2').show(); $('#toolkit-b-3').hide();
				$('#toolkit1').show();
				$('#toolkit2').show().attr('title', '').attr('data-original-title', 'Search and Filter Data').find('span').removeClass().addClass('glyphicon glyphicon-search');
				$('#toolkit4').hide();

				if (page == 'list-whouse') {
					if (DB.getUserEmp().title == 2) {
						$('#toolkit3').show().attr('title', '').attr('data-original-title', 'Add Warehouse Information').find('span').removeClass().addClass('glyphicon glyphicon-import');
						$('#toolkit3').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage('add?type=whouse&refresh=true', false, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
					} else {
						$('#toolkit3').hide();
					}
				} else if (page == 'list-item') {
					if (DB.getUserEmp().title <= 4) {
						$('#toolkit3').show().attr('title', '').attr('data-original-title', 'Add Product Information').find('span').removeClass().addClass('glyphicon glyphicon-import');
						$('#toolkit3').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage('add?type=item&refresh=true', false, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
					} else {
						$('#toolkit3').hide();
					}
				} else if (page == 'list-contact') {
					if (DB.getUserEmp().title <= 4) {
						$('#toolkit3').show().attr('title', '').attr('data-original-title', 'Add New Contact').find('span').removeClass().addClass('glyphicon glyphicon-import');
						$('#toolkit3').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage('add?type=contact&refresh=true', false, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
					} else {
						$('#toolkit3').hide();
					}
				}				
				$('#toolkit4').hide();
				$('#toolkit1').off('click').on('click', function() {
					if ($(this).prop('disabled') !== 'true') {
						openPage(currentPageName, true, false);
						$('div[name=mainbody]:visible').scrollTop(0);
					}
				});				

				var toggleSearchMode_management = function(e, status) {
					if (status === 1 || (status === undefined && (!$('#toolkit2').prop('active') || $('#toolkit2').prop('active') == 'false'))) {
						openFilterTable('#'+prefix+'-list-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Stop Search Mode and Back to View Mode').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
						$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
						$('#toolkit-b-1').off('click').on('click', toggleSearchMode_management);
						$('#toolkit1').attr('title', '').attr('data-original-title', 'Clear All Filter Conditions').find('span').removeClass().addClass('glyphicon glyphicon-remove-sign');
						$('#toolkit1').off('click').on('click', function() {
							var uls = $('table[stype*=f]').find('thead>tr>th>ul');
							uls.find('input[type=search]').val('').trigger('input');
							uls.find('input[name=min]').val('').trigger('input');
							uls.find('input[name=max]').val('').trigger('input');
							uls.find('select').val('').trigger('change');
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Finish Searching and Return').addClass('active-block');
						$('#toolkit2').addClass('bc-a').prop('active', 'true');	
						$('#toolkit3').hide();
						
						$('#'+prefix+'-search-product').parent('div').removeClass('hide');						
						$('#'+prefix+'-search-product').off('input').on('input', function() {	
							var value = $(this).val().trim();								
							if (page == 'list-whouse') {
								var sql_results = alasql('select * from whouse');
								var results = fuzzySearch(sql_results, ['code', 'name', 'addr', 'tel'], value, null);
								var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+p.name+'  '+p.code+'('+p.addr+', '+p.tel+')<span class="glyphicon"></span></li>'});
							} else if (page == 'list-item') {
								var sql_results = alasql('select item.*, kind.text from item left join kind on item.kind_id = kind.id;');
								var results = fuzzySearch(sql_results, ['code', 'text', 'detail', 'comment', 'maker', 'unit'], value, null);
								var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+p.code+'  '+p.detail+'('+p.text+', '+p.maker+', '+p.unit+')<span class="glyphicon"></span></li>'});
							} else if (page == 'list-contact') {
								var emps = alasql('select * from emp;');
								var emp_results = fuzzySearch(emps, ['id', 'emp_num', 'name', 'tel', 'email', 'title'], value, ['our company'], {'title':{'removeOrigin':true,'func':function(num){return empTitle(num);}}, 'id':{'removeOrigin':false,'func':function(id){return getEmpWhouseStr(id, true);}}});
								var partners = alasql('select * from partner;');
								var partner_results = fuzzySearch(partners, ['emp_num', 'name', 'tel', 'email', 'title', 'company'], value, null);
								var p_lis = partner_results.map(function(p){return '<li p-id="' + p.id + '" p-type="2"> '+p.name+' ('+p.company+') '+p.title+' ('+p.emp_num+', '+p.tel+', '+p.email+')<span class="glyphicon"></span></li>'});
								var e_lis = emp_results.map(function(p){return '<li p-id="' + p.id + '" p-type="1"> '+p.name+' (Our Company) '+empTitle(p.title)+' ('+p.emp_num+', '+p.tel+', '+p.email+')'+( getEmpWhouseStr(p.id) == '' ? '' : ' ('+getEmpWhouseStr(p.id)+')')+'<span class="glyphicon"></span></li>'});
								var lis = e_lis.concat(p_lis);
							}
							
							$(this).nextAll('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));
							if(value.length == 0 || lis.length == 0) {
								$(this).nextAll('ul[class*=recom-ul]').addClass('hide');
							}

							$(this).nextAll('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
								var id = $(this).attr('p-id');
								var ptype = $(this).attr('p-type');
								ptype = ptype == 2?'partner':(ptype==1?'emp':ptype);
								openPage(getDetailPage(page)+'?id='+id+(ptype?'&type='+ptype:''), false, false);
							});
						});
						$('#'+prefix+'-search-product-close').off('click').on('click', function(){
							$('#'+prefix+'-search-product').val('').trigger('input');
						});
						funcBar_page[page]['status'] = 1;
					} else {
						closeFilterTable('#'+prefix+'-list-table');
						$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Operate').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-wrench');
						$('#toolkit-b-1').css('cursor', 'auto').removeClass('big-block-enable').find('span[class*=block-name]').text('Operate');
						$('#toolkit-b-1').off('click');
						$('#toolkit1').show().attr('title', '').attr('data-original-title', 'Refresh Page').find('span').removeClass().addClass('glyphicon glyphicon-refresh');
						$('#toolkit1').off('click').on('click', function() {
							if ($(this).prop('disabled') !== 'true') {
								openPage(currentPageName, true, false);
								$('div[name=mainbody]:visible').scrollTop(0);
							}
						});
						$('#toolkit2').attr('title', '').attr('data-original-title', 'Search and Filter Data').removeClass('active-block');
						$('#toolkit2').removeClass('bc-a').prop('active', 'false');
						if (page == 'list-whouse' && DB.getUserEmp().title == 2) {
							$('#toolkit3').show();
						} else if (page == 'list-item' && DB.getUserEmp().title <= 4) {
							$('#toolkit3').show();
						} else if (page == 'list-contact' && DB.getUserEmp().title <= 4) {
							$('#toolkit3').show();
						}

						$('#'+prefix+'-search-product').parent('div').addClass('hide');
						$('#'+prefix+'-search-product').val('').trigger('input');
						funcBar_page[page]['status'] = 0;
					}
					tooltip();
				}
				$('#toolkit2').off('click').on('click', toggleSearchMode_management);
				
				if (couldBack && funcBar_page[page] && funcBar_page[page]['pageName'] == pageName && funcBar_page[page]['status'] == 1) {					
					toggleSearchMode_management(null, 1);
				} else {
					funcBar_page[page] = {};
					funcBar_page[page]['status'] = 0;
					funcBar_page[page]['pageName'] = pageName;
					toggleSearchMode_management(null, 0);
				}
				$('#f3-'+getDetailPage(page)).addClass('bc-a-f');
				break;

			case 'list-alert':
			case 'list-prediction':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').show(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Operate').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-wrench');
				$('#toolkit-b-1').css('cursor', 'auto').removeClass('big-block-enable').find('span[class*=block-name]').text('Operate');
				$('#toolkit-b-1').off('click');
				$('#toolkit1').show();$('#toolkit2').hide();$('#toolkit3').hide();$('#toolkit4').hide();
				$('#toolkit1').show().attr('title', '').attr('data-original-title', 'Refresh Page').find('span').removeClass().addClass('glyphicon glyphicon-refresh');
				$('#toolkit1').off('click').on('click', function() {
					if ($(this).prop('disabled') !== 'true') {
						openPage(currentPageName, true, false);
						$('div[name=mainbody]:visible').scrollTop(0);
					}
				});					
				$('#f2-'+getDetailPage(page)).addClass('bc-a-f');
				break;

			case 'prediction':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f2-'+page).addClass('bc-a-f');
				$('#toolkit-b-2').show(); $('#toolkit1').hide(); $('#toolkit2').hide(); $('#toolkit3').hide(); $('#toolkit4').hide();
				break;


			case 'item':
			case 'itembatch':
			case 'whouse':
			case 'contact':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f3-'+page).addClass('bc-a-f');
				$('#toolkit-b-2').show(); $('#toolkit1').hide(); $('#toolkit2').hide(); $('#toolkit3').hide(); $('#toolkit4').hide();
				break;


			case 'setting':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f4-'+page).addClass('bc-a-f');
				$('#toolkit-b-2').show(); $('#toolkit1').hide(); $('#toolkit2').hide(); $('#toolkit3').hide(); $('#toolkit4').hide();
				break;



			case 'add':
				$('#toolkit-b-1').show(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
				$('#toolkit-b-1').attr('title', '').attr('data-original-title', 'Back').find('span[class*=glyphicon]').removeClass().addClass('glyphicon glyphicon-arrow-left');
				$('#toolkit-b-1').css('cursor', 'pointer').addClass('big-block-enable').find('span[class*=block-name]').text('Back');
				$('#toolkit-b-1').off('click').on('click', function(){historyBack()});
				$('#f3-'+obj.type).addClass('bc-a-f');
				$('#toolkit-b-2').show(); $('#toolkit1').show(); $('#toolkit2').hide(); $('#toolkit3').hide(); $('#toolkit4').hide();					
				$('#toolkit1').attr('title', '').attr('data-original-title', 'Save').find('span').removeClass().addClass('glyphicon glyphicon-floppy-disk');
				$('#toolkit1').off('click').on('click', function(){
					$('#add-save').filter(':visible').trigger('click');
				});				
				break;

			default:
				$('#toolkit-b-1').hide(); $('#toolkit-b-2').hide(); $('#toolkit-b-3').hide();
		}
		tooltip();		
	}

	function addInfoMess(title, content, time, height) {		
		var infoBlock = $('<div class="information-block">\
			<div class="information-close"><span>×</span></div>\
			<div class="information-content"><span class="glyphicon glyphicon-comment" style="font-weight:bold">&nbsp;<p class="information-content-title"></p></span></div>\
			</div>');
		height ? infoBlock.css('height', height) : null;
		height ? infoBlock.children('div[class=information-content]').css('height', height) : null;
		infoBlock.find('div[class=information-content]>span>p').append(title);
		infoBlock.find('div[class=information-content]').append(content);
		infoBlock.appendTo('#info-bar');

		infoBlock.find('div[class=information-close]').on('click', function(){
			infoBlock.remove();
		});

		setTimeout(function() {
			infoBlock.addClass('info-block-close');
		}, time ?  (time > 5000 ? time - 5000 : 0) : 0);
		setTimeout(function() {
			infoBlock.remove();
		}, time ? time-200 : 4800);
	};

	function openPage(pageName, isFirst, isBack) {
		if (pageName!='login' && !DB.getUser()) {
			openPage('login', true, false);
			return;
		}		
		if (pageName.trim() == '') return;
		
		var page = pageName.split('?')[0];
		var params = pageName.split('?')[1];		
		var obj = Object.create(null);
		var couldBack = isBack;
		if (params) {
			var arr = params.split('&');
			for (var i=0; i<arr.length; i++) {
				var item = arr[i];
				var key = item.split('=')[0];
				var value = item.split('=')[1];
				obj[key] = value;
			}
		}
		
		if ((page == 'check-in-order' || page == 'check-out-order' || page == 'transfer-order') && obj.id && stockPage[page] == page) {			
			if (!confirm('Open this order would reset the unsaved '+page+' application, are you sure to do so?')) {
				return;
			}
		}
		if ((page == 'check-in-order' || page == 'check-out-order' || page == 'transfer-order') && obj.id) {
			if (!checkViewOrderPriority(page=='check-in-order'?1:(page=='check-out-order'?2:3), obj.id))
				return;
		}

		console.log('openpage:'+pageName);
		currentPageName = pageName;
		if (page != 'add') {
			setHistoryBackObj(null, null);
		}
		customFunctionBar(pageName, page, couldBack, obj);
		if (stockPage[page]) {
			$('div[name=mainbody]').hide();
			$('div[name=mainbody]').removeClass('main-body-larger-anim');
			$('div[name=mainbody][page="' + page + '"]').show();
			if (stockPage[page] != pageName || !isBack) {
				$('div[name=mainbody]:visible').scrollTop(0);
				couldBack = false;
			}
			stockPage[page] = pageName;
			obj['couldBack'] = couldBack ? true : false;
			$('body').trigger(page, obj);
		} else {
			$('#loading').show();
			switch(pageName) {
	  			default:	  				
	  				$.get(page + '.html').done(function(data) {
	  					$('#loading').hide();
	    				$('div[name=mainbody]').hide();
	    				$('div[name=mainbody]').removeClass('main-body-larger-anim');
	    				$('body').append(data);
	    				$('div[name=mainbody]:visible').attr('pageName', pageName);
	    				$('div[name=mainbody]:visible').attr('page', page);
	    				stockPage[page] = pageName;
	    				isFunctionBarShown ? null : $('div[name=mainbody]:visible').addClass('main-body-larger');	    				
	    				$('body').trigger(page, obj);
	  				}).fail(function(e){
	  					$('#loading').hide();
	  					alert('Getting HTML file from the server fails.');
	  					historyBack(); // should back?
	  					console.log(e);
	  				});
			}
		}			

		if (!isBack) {
			addHistory(pageName, isFirst);
		}			
	};

	function finalInit() {
		if (DB.getUser()) {
			$('#nav-home,#nav-user,#openFuncBar,#functionbar').removeClass('tem-hide');
			$('#index-username').text(DB.getUserEmp().name);
		}
		if (DB.loadFinish) {
			$('body').show();
		}
	};

	function tooltip() {
		$('[data-toggle="tooltip"]').tooltip('destroy');
		$('[data-toggle="tooltip"]').tooltip('init');
	}

	function historyBack(isRefresh, isScrollTop, isScrollTopNewPage) {
		if (history.state == 'check-in-order' || history.state == 'check-out-order' || history.state == 'transfer-order') {
			stockPage[history.state] = history.state+'?finish=false';
		}
		if (isScrollTop) {
			$('div[name=mainbody]:visible').scrollTop(0);
		}
		history.back();
		currentPageName = history.state; // this line could be delete because the history.state would not change synchronously
		if (isRefresh) {	
			setTimeout(function(){
				openPage(currentPageName, true, false);
				if(isScrollTopNewPage) {
					$('div[name=mainbody]:visible').scrollTop(0);
				}
			}, 150);		
		}
	}

	function setHistoryBackObj($obj, event) {
		historyBackObj.event = event;
		historyBackObj.$obj = $obj;
	}

	function runAndResetHistoryBackObj(newItem) {
		if (historyBackObj.$obj && historyBackObj.event) {
			historyBackObj.$obj.trigger(historyBackObj.event, newItem);
		}
		historyBackObj = Object.create(null);		
	}

	function fuzzySearch(objs, nameArr, value, otherStrArr, revData) {
		var indexResults = [];
		var results = [];
		var longStr = '';
		if (value === null || value === undefined) return;
		var value = value.trim();

		for (var i=0; i<nameArr.length; i++) {
			var name = nameArr[i];
			objs.forEach(function(p){
				if(!(revData && revData[name] && revData[name]['removeOrigin']) && p[name] && typeof p[name] === 'string' && p[name].lIndexOf(value) != -1 && $.inArray(p.id, indexResults) == -1){
					indexResults.push(p.id);
					results.push(p);
				} else if (revData && revData[name]) {
					try {
						var trueValue = revData[name]['func'](p[name]);
					} catch(e) {
						var trueValue = undefined;
					}
					if (trueValue && typeof trueValue === 'string' && trueValue.lIndexOf(value) != -1 && $.inArray(p.id, indexResults) == -1) {
						indexResults.push(p.id);
						results.push(p);
					}
				}
			});
		}
		
		objs.forEach(function(p){
			var str = '';
			nameArr.forEach(function(n){
				str += (  (p[n] && !(revData && revData[n] && revData[n]['removeOrigin'])) ? (p[n] + ' ') : ' '  );
				if (revData && revData[n]) {
					try {
						str += revData[n]['func'](p[n]) + ' ';
					} catch(e) {
						str += ' ';
					}					
				}
			});	
			otherStrArr ? otherStrArr.forEach(function(s){str += s + ' '}) : null;			
			if(value) {
				var isFound = true;
				value.split(' ').forEach(function(v){if(str.lIndexOf(v.trim()) == -1){isFound = false;}});
				if (isFound && $.inArray(p.id, indexResults) == -1){
					indexResults.push(p.id);
					results.push(p);
				}
			}
		});	
		return results;
	}	

	function checkEmptyResult(arr) {
		if (arr.length == 0) {
			addInfoMess('No result found:', '<p>You might not be authorized to view some results.</p>', null, 90);
		}
	}

	function checkViewOrderPriority(order_type, order_id) {
		order_id = parseInt(order_id);
		order_type = parseInt(order_type);
		var result = false;
		if (DB.getUserEmp().title <= 3) {
			result = true;
		} else if (DB.getUserEmp().title == 4) {
			if (order_type == 1) {
				var order = alasql('select * from inorder where id=?;', [order_id])[0];
				result = DB.keeperPriorityWhouse(order.whouse_id) || order.applyer_cid == DB.getCid();
			} else if (order_type == 2) {
				var order = alasql('select * from outorder where id=?;', [order_id])[0];
				result = DB.keeperPriorityWhouse(order.whouse_id) || order.applyer_cid == DB.getCid();
			} else if (order_type == 3) {
				var order = alasql('select * from transferorder where id=?;', [order_id])[0];
				result = DB.keeperPriorityWhouse(order.whouse_in_id) || DB.keeperPriorityWhouse(order.whouse_out_id) || order.applyer_cid == DB.getCid();
			}
		} else if (DB.getUserEmp().title == 5) {
			result = DB.isWorkerTask(order_type, order_id, DB.getCid());
		}
		if (!result) {
			addInfoMess('Unauthorized:', '<p>You might not be authorized to view this order.</p>', null, 90);
		}
		return result;
	}


	$('body').on('check-in', function(e, obj){
		if (obj.couldBack) return;		

		var sql = 'SELECT inorder.*, whouse.code as whouse_code, whouse.name as whouse_name from inorder\
		 	left join whouse on inorder.whouse_id = whouse.id;';
		var orders = alasql(sql);
		if (DB.getUserEmp().title == 4) {
			var empWhouses = alasql('select * from emp_whouse where emp_id = ?;', [DB.getCid()]).map(function(i){return i.whouse_id});
			orders = orders.filter(function(o){return $.inArray(o.whouse_id, empWhouses) >= 0 || o.applyer_cid == DB.getCid();});
		} else if (DB.getUserEmp().title == 5) {
			var orderIds = alasql('select * from task where order_type = ? and worker_cid = ?', [1, DB.getCid()]).map(function(i){return i.order_id});
			orders = orders.filter(function(o){return $.inArray(o.id, orderIds)>=0;});
		} 	
		checkEmptyResult(orders);	

		var tbody = $('#lci-tbody');
		tbody.empty();
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		
		for (var i = 0; i < orders.length; i++) {			
			var order = orders[i];
			var transport = alasql('select * from transport where order_id = ? and order_type = ?;', [order.id, 1])[0];
			var tr = $('<tr data-href="check-in-order?id=' + order.id + '"></tr>');
			var applyer = alasql('select * from emp where id = ?', [order.applyer_cid])[0];
			var supplier_c = order.supplier_type == 1 ? alasql('select * from emp where id = ?', [order.supplier_cid])[0] : alasql('select * from partner where id = ?', [order.supplier_cid])[0]; 

			tr.append('<td >' + order.id + '</td>');
			tr.append('<td >' + orderStatusLabel(1, order.status) + '</td>');
			tr.append('<td >' + order.update_time + '</td>');
			tr.append('<td pid="'+applyer.id+'">' + applyer.name + ' (' + applyer.emp_num + ') ' + empTitle(applyer.title) + '</td>');
			tr.append('<td >' + order.apply_time + '</td>');
			tr.append('<td >' + order.supplier_name + '</td>');
			tr.append('<td >' + order.whouse_name + '</td>');
			tr.append('<td >' + transport.arrival_date + '</td>');		
		
			tr.appendTo(tbody);
		}

		function initTrClick() {			
			$('#lci-tbody > tr').css('cursor', 'pointer').off('click');
			$('#lci-tbody > tr').css('cursor', 'pointer').on('click', function() {
				openPage($(this).attr('data-href'), false, false);
			});
		}
		initTrClick();
		
		initSortTable('#list-checkin-table', initTrClick);
		initFixedTable('#list-checkin-table');	
		$('#lci-th-update-time').trigger('click').trigger('click');
	});


	$('body').on('check-in-order', function(e, obj){		
		if (obj.couldBack) return;
		$('#nci-contact-supplier').val('').prop('disabled', false);
		$('#nci-company-supplier').val('').prop('disabled', false);
		$('#nci-whouse-select').val('').prop('disabled', false);
		$('#nci-arrival-date').val('').prop('disabled', false);
		$('#nci-title-order-id').val('').prop('disabled', false).parent().addClass('hide');
		$('#nci-applyer').val('').prop('disabled', false).parent().addClass('hide');
		$('#nci-apply-time').val('').prop('disabled', false).parent().addClass('hide');			
		$('#nci-reason').val('').prop('disabled', false);
		$('#nci-inorder-comment').val('').prop('disabled', false);
		$('#nci-new-contact').show();
		$('#nci-new-product').show();
		$('#nci-search-product').show();
		$('#nci-submit-inorder').show();
		$('#nci-title-order-status').text('Creating');
		$('#nci-product-table tbody').empty();
		$('#nci-submit-warning').text('').parent('label').parent('div').hide();
		$('#nci-orderhistory-div').hide();
		$('#nci-updatestatus-div').hide();
		$('#nci-currentstatus-div').find('div[id*=nci-viewprefix]').hide();
		$('#nci-updatestatus-div').find('div[id*=nci-newprefix]').hide();
		$('#nci-nextstep-info').addClass('hide');

		// warehouse options
		var whouses = alasql('select * from whouse;');
		$('#nci-whouse-select').find('option').remove();		
		whouses.forEach(function(w){$('<option></option>').attr('value', w.id).text(w.name+' ('+w.code+')').appendTo($('#nci-whouse-select'));});
		$('#nci-whouse-select').val('');
	
		//add new product
		$('#nci-new-product').off('click').on('click', function() {
			$('#nci-new-product').off('additem').on('additem', function(e, newItem){
				$('#nci-search-product').trigger('input', newItem.id);
			});
			setHistoryBackObj($('#nci-new-product'), 'additem');
			openPage('add?type=item', false, false);
		});

		//add new contact
		$('#nci-new-contact').off('click').on('click', function() {
			openPage('add?type=contact', false, false);
		});

		// search products
		$('#nci-search-product').off('input').on('input', function(e, pid) {	
			if (pid) {
				var temLi = $('<li></li>');
				$(this).next('ul[class*=recom-ul]').empty().addClass('hide').val('').append(temLi);	
			} else {
				var products = alasql('select item.*, kind.text from item left join kind on kind.id = item.kind_id;');
				var value = $(this).val().trim();
				var results = fuzzySearch(products, ['code', 'detail', 'maker', 'text'], value);
				var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+p.code+', '+p.detail+' ('+p.maker+', '+p.text+')<span class="glyphicon"></span></li>'});
				$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));	
				if(value.length == 0 || results.length == 0) {
					$(this).next('ul[class*=recom-ul]').addClass('hide');
				}			
			}			
			

			$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function(e, pid) {
				var id = pid ? pid : $(this).attr('p-id');				
				var p = alasql('select item.*, kind.text from item left join kind on kind.id = item.kind_id where item.id = ?;', [parseInt(id)])[0];
				var tr = $('<tr pid="'+p.id+'"><td>'+p.code+'</td><td>'+p.detail+'</td><td><div><select style="width:calc(100% - 25px);display:inline;" class="form-control"></select>&nbsp;<span class="glyphicon glyphicon-plus add-new-batch" name="createNewProductItem" title="Create new product batch information" type="button" data-toggle="tooltip" data-placement="bottom"></span></div></td><td><input type="number" class="form-control" name="balance" style="max-width:180px;display:inline;width:calc(100% - 22px);">&nbsp;<span class="glyphicon glyphicon-remove order-remove-product" title="Remove this record." type="button" data-toggle="tooltip" data-placement="bottom"></span></td></tr>');
				tr.appendTo($('#nci-product-table').find('tbody'));
				tr.find('[name=createNewProductItem]').off('click').on('click', function(){
					var tr = $(this).parents('tr:first');
					tr.off('additembatch').on('additembatch', function(e, newItem){
						tr.find('select').append('<option value="'+newItem.id+'">'+newItem.lot+' (EXP:'+newItem.expiration_date+')</option>');
						tr.find('select').val(newItem.id);
					});
					setHistoryBackObj(tr, 'additembatch');
					openPage('add?type=itembatch&item_id='+tr.attr('pid'), false, false);
				});
				var batches = alasql('select * from itembatch where item_id = ?;', [p.id]);
				tr.find('select').append(batches.map(function(b){return '<option value="'+b.id+'">'+b.lot+' (EXP:'+b.expiration_date+')</option>';}).join('\r\n'));
				tr.find('input[name=balance]').val(0);
				tr.find('span[class*=order-remove-product]').off('click').on('click', function(){
					tr.remove();
				});
				$('#nci-search-product').val('').trigger('input');
				tooltip();
			});
			if (pid) {
				temLi.trigger('click', pid).remove();
			}
		});
		
		//supplier contact
		$('#nci-contact-supplier').off('input').on('input', function(e, p1) { //p1 mean select one.
			if (p1) {
				$(this).next('ul[class*=recom-ul]').empty().addClass('hide');
				return;
			}
			if ($('#nci-contact-supplier').attr('p-id') && $('#nci-contact-supplier').attr('p-id').length > 0) {
				$('#nci-contact-supplier').removeAttr('p-id').removeAttr('p-type').val('');
				return;
			}

			var partners = alasql('select * from partner');
			var emps = alasql('select * from emp');
			emps.forEach(function(e){e.title_rev = empTitle(e.title)});
			var value = $(this).val().trim();
			var p_res = fuzzySearch(partners, ['name','emp_num', 'company', 'title', 'tel', 'email'], value);
			var e_res = fuzzySearch(emps, ['name', 'emp_num', 'title_rev', 'tel', 'email'], value, ['our company']);
			var p_lis = p_res.map(function(p){return '<li p-id="' + p.id + '" p-type="2"> '+p.name+' ('+p.company+') '+p.title+' ('+p.emp_num+', '+p.tel+', '+p.email+')<span class="glyphicon"></span></li>'});
			var e_lis = e_res.map(function(p){return '<li p-id="' + p.id + '" p-type="1"> '+p.name+' (Our Company) '+p.title_rev+' ('+p.emp_num+', '+p.tel+', '+p.email+')<span class="glyphicon"></span></li>'});
			$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(p_lis.join('\r\n')).append(e_lis.join('\r\n'));
			if(value.length == 0 || p_lis.length + e_lis.length == 0) {
				$(this).next('ul[class*=recom-ul]').addClass('hide');
			}

			$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
				var type = parseInt($(this).attr('p-type'));
				var id = $(this).attr('p-id');				
				var p = alasql('select * from ' + (type == 1 ? 'emp':'partner')  + ' where id = ?;', [parseInt(id)])[0];
				$('#nci-company-supplier').val(type == 1 ? 'Our Company' : p.company);
				$('#nci-contact-supplier').attr('p-type', type).attr('p-id', id).val($(this).text()).trigger('input', [true]);
			});
		});

		// submit new inorder
		$('#nci-submit-inorder').off('click').on('click', function() {
			$('#nci-submit-warning').text('').parent('label').parent('div').hide();
			var warning = [];
			if (!$('#nci-contact-supplier').attr('p-id') || $('#nci-company-supplier').val().trim().length == 0) {
				warning.push('"Contact Person of Supplier" and "Supplier Company" could not be empty.');
			}
			if($('#nci-product-table tbody tr').length == 0) {
				warning.push('Please select at least one product to check-in.');
			}
			if(!$('#nci-whouse-select').val()) {
				warning.push('Please select which warehouse to check-in.');
			}
			var isZeroProductitem = false;			
			$('#nci-product-table tbody tr input[name=balance]').each(function(){if(parseInt($(this).val()) <= 0 || parseInt($(this).val()) != parseFloat($(this).val())){isZeroProductitem = true;}});
			if (isZeroProductitem){warning.push('The amount of check-in product item is in wrong form. Please correct it.');};
			var batchitem_check = [];
			var isSameProductitem = false;
			var noProductBatch = false;
			$('#nci-product-table tbody tr select').each(function(){
				if($.inArray($(this).val(), batchitem_check) >= 0){
					isSameProductitem = true;
				}else{
					batchitem_check.push($(this).val());
				}
				if (!$(this).val()) {
					noProductBatch = true;
				}
			});
			if (isSameProductitem){warning.push('There are same product belong to the same product. Please remove redundancy.');};
			if (noProductBatch){warning.push('Please select a batch of each product.');};
			if (warning.length != 0) {
				warning.unshift('Submit Fail:');
				$('#nci-submit-warning').empty().append(warning.join('<br/>&nbsp;&nbsp;&nbsp;&nbsp;')).parent('label').parent('div').show();
				$('[name=mainbody]').filter(':visible').scrollTop($('#nci-submit-warning')[0].offsetTop);
			} else {
				var newOrderId = DB.saveCheckinOrder(DB.getCid(), $('#nci-contact-supplier').attr('p-id'), $('#nci-company-supplier').val(), $('#nci-contact-supplier').attr('p-type'), 
					$('#nci-whouse-select').val(), $('#nci-reason').val(), $('#nci-inorder-comment').val(), $('#nci-arrival-date').val(), $('#nci-product-table tbody tr'));				
				addInfoMess('Check-in Application:', '<p>Create success. Wait to be approved.</p>', null, 90);				
				history.replaceState('check-in-order?id='+newOrderId, null, null);
				stockPage['check-in-order'] = 'check-in-order?finish=true';
				openPage('check-in', false, false);
			};			
		});		

		if (obj.id) {
			//order detail
			var order = alasql('select * from inorder where id = ?;', [parseInt(obj.id)])[0];
			var transport = alasql('select * from transport where order_id = ? and order_type = ?;', [order.id, 1])[0];			
			var a = alasql('select * from emp where id = ?;', [order.applyer_cid])[0];
			var p = parseInt(order.supplier_type) == 1 ? alasql('select * from emp where id = ?;', [order.supplier_cid])[0] : alasql('select * from partner where id = ?;', [order.supplier_cid])[0];			
			$('#nci-contact-supplier').show().val(parseInt(order.supplier_type) == 1 ? ' '+p.name+' (Our Company) '+empTitle(p.title)+' ('+p.emp_num+', '+p.tel+', '+p.email+')' : ' '+p.name+' ('+p.company+') '+p.title+' ('+p.emp_num+', '+p.tel+', '+p.email+')').prop('disabled', true).css('cursor', 'text');
			$('#nci-company-supplier').show().val(parseInt(order.supplier_type) == 1 ? 'Our Company' : p.company).prop('disabled', true).css('cursor', 'text');
			$('#nci-whouse-select').val(order.whouse_id).prop('disabled', true).css('cursor', 'text');
			$('#nci-arrival-date').val(transport.arrival_date).prop('disabled', true);
			$('#nci-title-order-id').val(order.id).prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');
			$('#nci-applyer').val(' '+a.name+' (Our Company) '+empTitle(a.title)+' ('+a.emp_num+', '+a.tel+', '+a.email+')').prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');
			$('#nci-apply-time').val(order.apply_time).prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');			
			$('#nci-reason').val(order.reason).prop('disabled', true).css('cursor', 'text');
			$('#nci-inorder-comment').val(order.comment).prop('disabled', true).css('cursor', 'text');
			$('#nci-new-contact').hide();
			$('#nci-new-product').hide();
			$('#nci-search-product').hide();
			$('#nci-submit-inorder').hide();
			$('#nci-title-order-status').text(orderStatus(1, order.status));			
			var orderItemBatches = alasql('select orderitembatch.*, item.code, item.detail, itembatch.item_id, itembatch.lot from orderitembatch join itembatch on orderitembatch.itembatch_id = itembatch.id join item on item.id = itembatch.item_id where orderitembatch.order_id = ? and orderitembatch.order_type = ?;', [order.id, 1]);					
			var trs = orderItemBatches.map(function(p){var tr = $('<tr pid="'+p.id+'"><td>'+p.code+'</td><td>'+p.detail+'</td><td><div><select style="width:calc(100% - 25px);display:inline;" class="form-control"></select>&nbsp;</div></td><td><input type="number" name="balance" class="form-control" style="max-width:180px;display:inline;width:calc(100% - 22px);">&nbsp;</td></tr>');
								var batches = alasql('select * from itembatch where item_id = ?;', [p.item_id]);
								tr.find('select').append(batches.map(function(b){return '<option value="'+b.id+'">'+b.lot+' (EXP:'+b.expiration_date+')</option>';}).join('\r\n')).val(p.itembatch_id);
								tr.find('input[name=balance]').val(order.status == 9 ? p.actual_balance : p.balance);
								tr.find('select,input').prop('disabled', true).css('cursor', 'text');
								var stock = alasql('select * from stock where itembatch_id = ? and whouse_id = ?;', [p.itembatch_id, order.whouse_id])[0];								
								tr.off('click').on('click', function(){if(stock && stock.id){openPage('stock?id='+stock.id, false, false);}else{openPage('item?id='+p.item_id, false, false);}}).css('cursor', 'pointer');
								return tr;});
			$('#nci-product-table tbody').append(trs);
			$('#nci-product-table thead').find('#nci-product-table-th-amount').text(order.status == 9 ? 'Actual Amount' : 'Amount');

			// order history
			$('#nci-orderhistory-div').show();
			var orderHistory = alasql('select * from orderstatushistory where order_id = ? and order_type = ? order by orderstatushistory.id DESC;', [order.id, 1]);
			$('#nci-orderhistory-table').find('tbody').empty().append(orderHistory.map(function(i) {
				var changer = DB.findContact(i.who_cid, true);
				var $tr = $('<tr><td style="width:30%">'+i.time+'</td><td style="width:70%"><span class="glyphicon glyphicon-arrow-right"></span><span style="font-weight:bold">'+orderStatus(1, i.to_status)+'</span><br/>Changed By: <span style="text-decoration:underline;cursor:pointer" name="contact">'+changer.name+'</span> <br>Comment:&nbsp;&nbsp;&nbsp;&nbsp;'+i.comment+'</td></tr>');
				$tr.find('span[name=contact]').off('click').on('click', function(){
					openPage('contact?type=emp&id='+changer.id, false, false);
				});
				return $tr;
			}));
			
			//order current status			
			if (order.status >= 5) {
				$('#nci-viewprefix-transport').show().off('click').on('click', function(){$('#nci-viewprefix-transport-div').toggle()});
				var transport = alasql('select * from transport where order_type = ? and order_id = ?;', [1, order.id])[0];
				$('#nci-transport-company-view').val(transport.company);
				$('#nci-transport-num-view').val(transport.num);
				$('#nci-transport-delivery-view').val(transport.delivery_date);
				$('#nci-transport-arrival-view').val(transport.arrival_date);
			}
			if (order.status >= 8) {
				$('#nci-viewprefix-inspection').show().off('click').on('click', function(){$('#nci-viewprefix-inspection-div').toggle()});
				$('#nci-inspection-table-view').find('tbody').empty().append(orderItemBatches.map(function(i){
					var item_id = alasql('select * from itembatch where id=?', [i.itembatch_id])[0].item_id;
					return $('<tr itemid="'+item_id+'"><td>'+i.code+'</td><td>'+i.lot+'</td><td>'+i.balance+'</td><td>'+ i.actual_balance +'</td></tr>');
				}));
				$('#nci-inspection-table-view').find('tbody tr').css('cursor', 'pointer').off('click').on('click', function(){
					openPage('item?id='+$(this).attr('itemid'), false, false);
				});
				var inspectionTask = alasql('select * from task where order_id = ? and order_type = ? and task_name = ?', [order.id, 1, 'inspection'])[0];
				var inspectionWorker = alasql('select * from emp where id = ?;', [inspectionTask.worker_cid])[0];
				$('#nci-inspection-table-view tfoot tr span[name=inspection-operator]').text(inspectionWorker ? inspectionWorker.name : '').off('click').on('click', function(){
					if (inspectionWorker)
						openPage('contact?type=emp&id='+inspectionWorker.id, false, false);
				});
			}
			if (order.status >= 9) {
				$('#nci-viewprefix-placing').show().off('click').on('click', function(){$('#nci-viewprefix-placing-div').toggle()});
				$('#nci-placing-table-view').find('tbody').empty().append(orderItemBatches.map(function(i){
					var item_id = alasql('select * from itembatch where id=?', [i.itembatch_id])[0].item_id;
					return $('<tr itemid="'+item_id+'"><td>'+i.code+'</td><td>'+i.lot+'</td><td>'+i.place_in+'</td></tr>');
				}));
				$('#nci-placing-table-view').find('tbody tr').css('cursor', 'pointer').off('click').on('click', function(){
					openPage('item?id='+$(this).attr('itemid'), false, false); 
				});
				var placingTask = alasql('select * from task where order_id = ? and order_type = ? and task_name = ?', [order.id, 1, 'placing'])[0];
				var placingWorker = alasql('select * from emp where id = ?;', [placingTask.worker_cid])[0];
				$('#nci-placing-table-view tfoot tr span[name=placing-operator]').text(placingWorker ? placingWorker.name : '').off('click').on('click', function(){
					if (placingWorker)
						openPage('contact?type=emp&id='+placingWorker.id, false, false);
				});
			}


			//order update status
			$('#nci-updatestatus-div').show();
			$('#nci-update-inorder-comment').val('');
			$('#nci-updatestatus-warning').parent('label').hide();
			var statusOptions = [];			
			if (order.status == 1) {
				if (DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id)))
					statusOptions.push(4,3);
			} else {
				if ( DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id)) ) {
					for (var i = order.status+1; i<=9; i++) {
						if (i !=  7) {
							statusOptions.push(i);
						}
					}
					if (order.status < 7) {
						statusOptions.push(7);
					}					
				} else if (DB.getUserEmp().title == 5 && DB.isWorkerTask(1, order.id, DB.getCid())) {
					var tasks = DB.getWorkerAllTask(1, order.id, DB.getCid()).sort(); //trick!!
					var isCouldReturn = false;
					tasks.forEach(function(task){
						if (task == 'inspection') {
							for (var i = order.status+1; i<=8; i++) {
								if (i !=  7) {
									statusOptions.push(i);
								}
							}
							if (order.status < 7) {
								isCouldReturn = true;								
							}
						} else if (task == 'placing') {
							if (order.status <= 8) {
								statusOptions.push(9);
							}
						}	
					});
					if (isCouldReturn) {
						statusOptions.push(7);
					}	 		
				}
			}
			if (order.applyer_cid == DB.getCid() || DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id))) {
				statusOptions.push(2);
			}
			if (statusOptions.length <= 0) {
				$('#nci-updatestatus-div').hide();
				$('#toolkit1').hide();
			}

			//order 'next step'
			var nextStepArr = [1, 4, 5, 6, 8];
			if ($.inArray(order.status, nextStepArr) > -1 && $.inArray(order.status, statusOptions) > -1 &&
					(DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id)) || (DB.getUserEmp().title == 5 && DB.isWorkerTask(1, order.id, DB.getCid())) ) ) {				
				$('#nci-nextstep-info').removeClass('hide');
				$('#nci-nextstep-info span[id*=nci-status-message]').hide();
				$('#nci-status-message-'+order.status).show();
			} else {
				$('#nci-nextstep-info').addClass('hide');
			}

			$('#nci-select-new-status').empty().append(statusOptions.map(function(o){return $('<option value='+o+' style="color:'+orderStatusColor(1, o, order.status)+'">'+orderStatus(1, o)+'</option>');})).val(order.status);
			if (order.status == 2 || order.status == 3 || order.status == 7 || order.status == 9) {
				$('#nci-updatestatus-div').hide();	
				$('#toolkit1').hide();			
			} else {	
				// Transport	
				var transport = alasql('select * from transport where order_type = ? and order_id = ?;', [1, order.id])[0];
				$('#nci-transport-company-new').val(transport.company);
				$('#nci-transport-num-new').val(transport.num);
				$('#nci-transport-delivery-new').val(transport.delivery_date);
				$('#nci-transport-arrival-new').val(transport.arrival_date);

				//task
				$('#nci-inspection-cid-new, #nci-placing-cid-new').off('input').on('input', function(e, p1) {						
					if (p1) {
						$(this).next('ul[class*=recom-ul]').empty().addClass('hide');
						return;
					}
					if ($(this).attr('p-id') && $(this).attr('p-id').length > 0) {
						$(this).removeAttr('p-id').val('');
						return;
					}

					var emps = alasql('SELECT emp.* from emp left join emp_whouse on emp_whouse.emp_id = emp.id where emp_whouse.whouse_id = ? or emp.title = ?;', [order.whouse_id, 2]);
					emps.forEach(function(e){e.title_rev = empTitle(e.title)});
					var value = $(this).val().trim();
					var e_res = fuzzySearch(emps, ['name', 'emp_num', 'title_rev', 'tel', 'email'], value, ['our company']);						
					var e_lis = e_res.map(function(p){return '<li p-id="' + p.id + '"> '+p.name+' (Our Company) '+p.title_rev+' ('+p.emp_num+', '+p.tel+', '+p.email+')</li>'});
					$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(e_lis.join('\r\n'));
					if (value.length == 0 || e_lis.length == 0) {
						$(this).next('ul[class*=recom-ul]').addClass('hide');
					}

					$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
						var id = $(this).attr('p-id');				
						var p = alasql('select * from emp where id = ?;', [parseInt(id)])[0];
						$(this).parent('ul[class*=recom-ul]').prev('input').attr('p-id', id).val($(this).text()).trigger('input', [true]);
					});
				});
				$('#nci-inspection-cid-new, #nci-placing-cid-new').val('test').trigger('input').val('').trigger('input');
				var inspectionTask = alasql('select * from task where order_type = ? and order_id = ? and task_name = ?', [1, order.id, 'inspection'])[0];
				var placingTask = alasql('select * from task where order_type = ? and order_id = ? and task_name = ?', [1, order.id, 'placing'])[0];
				if (inspectionTask.worker_cid !== undefined) {
					$('#nci-inspection-cid-new').next('ul[class*=recom-ul]').find('li[p-id='+inspectionTask.worker_cid+']').trigger('click');
				}
				if (placingTask.worker_cid !== undefined) {
					$('#nci-placing-cid-new').next('ul[class*=recom-ul]').find('li[p-id='+placingTask.worker_cid+']').trigger('click');
				}	

				//inspection
				$('#nci-inspection-table-new').find('tbody').empty().append(orderItemBatches.map(function(i){var tr = $('<tr pid="'+i.id+'"><td>'+i.code+'</td><td>'+i.lot+'</td><td>'+i.balance+'</td><td><input type="number" name="act-num"></td></tr>');tr.find('input[name=act-num]').val(i.actual_balance);return tr;}));					

				//placing
				$('#nci-placing-table-new').find('tbody').empty().append(orderItemBatches.map(function(i){var tr = $('<tr pid="'+i.id+'"><td>'+i.code+'</td><td>'+i.lot+'</td><td><input name="place-input"></td></tr>');tr.find('input[name=place-input]').val(i.place_in);return tr;}));	
				
				// status change
				$('#nci-select-new-status').off('change').on('change', function() {
					$('#nci-newprefix-transport, #nci-newprefix-task, #nci-newprefix-inspection, #nci-newprefix-placing').hide();
					$('#nci-newprefix-transport-div, #nci-newprefix-task-div, #nci-newprefix-inspection-div, #nci-newprefix-placing-div').hide();
					if (order.status <= 4 && parseInt($(this).val()) >= 5) {
						$('#nci-newprefix-transport').show().off('click').on('click', function(){$('#nci-newprefix-transport-div').toggle()});
						$('#nci-newprefix-transport-div').show();
					}
					if (order.status <= 5 && parseInt($(this).val()) >= 6) {
						$('#nci-newprefix-task').show().off('click').on('click', function(){$('#nci-newprefix-task-div').toggle()});
						$('#nci-newprefix-task-div').show();
					}
					if (order.status <= 6 && parseInt($(this).val()) >= 8) {
						$('#nci-newprefix-inspection').show().off('click').on('click', function(){$('#nci-newprefix-inspection-div').toggle()});
						$('#nci-newprefix-inspection-div').show();
					}
					if (order.status <= 8 && parseInt($(this).val()) >= 9) {
						$('#nci-newprefix-placing').show().off('click').on('click', function(){$('#nci-newprefix-placing-div').toggle()});
						$('#nci-newprefix-placing-div').show();
					}

					// if (order.status >= 4 && order.status <= 5) {//4,5 show new transport
					// 	$('#nci-newprefix-transport').show().off('click').on('click', function(){$('#nci-newprefix-transport-div').toggle()});					
					// }
					// if (order.status >= 4 && order.status < 9) {//4,5,6,7,8  show allocate task
					// 	$('#nci-newprefix-task').show().off('click').on('click', function(){$('#nci-newprefix-task-div').toggle()});						
					// }
					// if (order.status >= 6 && order.status < 9) {//6,7,8  show inspection table 
					// 	$('#nci-newprefix-inspection').show().off('click').on('click', function(){$('#nci-newprefix-inspection-div').toggle()});					
					// }
					// if (order.status == 8) {//8 show placing table
					// 	$('#nci-newprefix-placing').show().off('click').on('click', function(){$('#nci-newprefix-placing-div').toggle()});					
					// }
				});
				$('#nci-select-new-status').trigger('change');
			}


			// update inorder status
			$('#nci-update-inorder').off('click').on('click', function() {
				$('#nci-updatestatus-warning').parent('label').hide();
				var warning = [];
				if (!$('#nci-select-new-status').val()) {
					warning.push('Must select the updated status.');
				}
				var isWrongActualNumForm = false;
				$('#nci-inspection-table-new').find('tbody tr input[name=act-num]').each(function(){
					if ($(this).val() === null || $(this).val() === "" || $(this).val() === undefined || parseInt($(this).val()) <= 0 || parseInt($(this).val()) != parseFloat($(this).val())) {
						isWrongActualNumForm = true;
					}
				})
				if (isWrongActualNumForm) {
					warning.push('The actual amount of product is in wrong form. Please correct it.');
				}
				if (warning.length > 0) {
					$('#nci-updatestatus-warning').empty().append('Update fail:<br>'+warning.join('<br>')).parent('label').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#nci-updatestatus-warning')[0].offsetTop);
					return;
				}
				DB.updateCheckinOrder(order, $('#nci-select-new-status').val(), $('#nci-update-inorder-comment').val(), $('#nci-transport-company-new').val(), $('#nci-transport-num-new').val(), $('#nci-transport-delivery-new').val(), $('#nci-transport-arrival-new').val(), $('#nci-inspection-cid-new').attr('p-id'), $('#nci-placing-cid-new').attr('p-id'), $('#nci-inspection-table-new').find('tbody tr'), $('#nci-placing-table-new').find('tbody tr'));				
				historyBack(true, true);
				addInfoMess('Check-in order: '+order.id, '<p>Change order stauts to "'+orderStatus(1, $('#nci-select-new-status').val())+'" success.</p>', 8000, 90);
			});

			
		}
	});




	


	$('body').on('check-out', function(e, obj){
		if (obj.couldBack) return;

		var sql = 'SELECT outorder.*, whouse.code as whouse_code, whouse.name as whouse_name from outorder\
		 	left join whouse on outorder.whouse_id = whouse.id;';
		var orders = alasql(sql);
		if (DB.getUserEmp().title == 4) {
			var empWhouses = alasql('select * from emp_whouse where emp_id = ?;', [DB.getCid()]).map(function(i){return i.whouse_id});
			orders = orders.filter(function(o){return $.inArray(o.whouse_id, empWhouses) >= 0 || o.applyer_cid == DB.getCid();});
		} else if (DB.getUserEmp().title == 5) {
			var orderIds = alasql('select * from task where order_type = ? and worker_cid = ?', [2, DB.getCid()]).map(function(i){return i.order_id});
			orders = orders.filter(function(o){return $.inArray(o.id, orderIds)>=0;});
		}
		checkEmptyResult(orders);

		var tbody = $('#lco-tbody');
		tbody.empty();
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		
		for (var i = 0; i < orders.length; i++) {			
			var order = orders[i];
			var transport = alasql('select * from transport where order_id = ? and order_type = ?;', [order.id, 2])[0];
			var tr = $('<tr data-href="check-out-order?id=' + order.id + '"></tr>');
			var applyer = alasql('select * from emp where id = ?', [order.applyer_cid])[0];
			var buyer_c = order.buyer_type == 1 ? alasql('select * from emp where id = ?', [order.buyer_cid])[0] : (
							order.buyer_type == 2 ? alasql('select * from partner where id = ?', [order.buyer_cid])[0] : 
								alasql('select * from tem_contact where id = ?', [order.buyer_cid])[0]); 

			tr.append('<td >' + order.id + '</td>');
			tr.append('<td >' + orderStatusLabel(2, order.status) + '</td>');
			tr.append('<td >' + order.update_time + '</td>');
			tr.append('<td pid="'+applyer.id+'">' + applyer.name + ' (' + applyer.emp_num + ') ' + empTitle(applyer.title) + '</td>');
			tr.append('<td >' + order.apply_time + '</td>');
			tr.append('<td >' + buyer_c.name + '</td>');
			tr.append('<td >' + order.whouse_name + '</td>');
			tr.append('<td >' + transport.delivery_date + '</td>');			
		
			tr.appendTo(tbody);
		}

		function initTrClick() {			
			$('#lco-tbody > tr').css('cursor', 'pointer').off('click');
			$('#lco-tbody > tr').css('cursor', 'pointer').on('click', function() {
				openPage($(this).attr('data-href'), false, false);
			});
		}
		initTrClick();
		
		initSortTable('#list-checkout-table', initTrClick);
		initFixedTable('#list-checkout-table');	
		$('#lco-th-update-time').trigger('click').trigger('click');
	});



	$('body').on('check-out-order', function(e, obj){	
		if (!checkOutStockRisk()) {
			$('#nco-submit-warning-risk').empty();
			$('#nco-submit-outorder-risk').hide();
		}	
		if (obj.couldBack) return;
		$('#nco-title-order-id').val('').prop('disabled', false).parent().addClass('hide');
		$('#nco-applyer').val('').prop('disabled', false).parent().addClass('hide');
		$('#nco-apply-time').val('').prop('disabled', false).parent().addClass('hide');	
		$('#nco-search-contact-div').show();	
		$('#nco-new-contact').show();
		$('#nco-contact-person').val('').prop('disabled', false);
		$('#nco-contact-person-name, #nco-contact-person-tel, #nco-contact-person-company').val('').prop('disabled', false);
		$('#nco-receiver-address').val('').attr('disabled', false);
		$('#nco-whouse-select').val('').prop('disabled', false);
		$('#nco-delivery-date').val('').prop('disabled', false);			
		$('#nco-reason').val('').prop('disabled', false);
		$('#nco-outorder-comment').val('').prop('disabled', false);
		
		//$('#nco-new-product').show();
		$('#nco-search-product').show();
		$('#nco-submit-outorder').show();
		$('#nco-submit-outorder-risk, #nco-update-outorder-risk').hide(); //risk
		$('#nco-title-order-status').text('Creating');
		$('#nco-product-table tbody').empty();
		$('#nco-submit-warning').text('').parent('label').parent('div').hide();
		$('#nco-submit-warning-risk, #nco-updatestatus-warning-risk').empty(); //risk
		$('#nco-update-outorder').prop('disabled', false);
		$('#nco-orderhistory-div').hide();
		$('#nco-updatestatus-div').hide();
		$('#nco-currentstatus-div').find('div[id*=nco-viewprefix]').hide();
		$('#nco-updatestatus-div').find('div[id*=nco-newprefix]').hide();
		$('#nco-nextstep-info').addClass('hide');

		// warehouse options
		var whouses = alasql('select * from whouse;');
		$('#nco-whouse-select').find('option').remove();		
		whouses.forEach(function(w){$('<option></option>').attr('value', w.id).text(w.name+' ('+w.code+')').appendTo($('#nco-whouse-select'));});
		$('#nco-whouse-select').val('');
		$('#nco-whouse-select').off('change').on('change', function() {			
			var pre_ids = $('#nco-product-table tbody tr').toArray().map(function(t){return parseInt($(t).attr('pid'));});			
			$('#nco-product-table tbody').empty();
			$('#nco-search-product').trigger('input', true);			
			pre_ids.forEach(function(i){$('#nco-search-product').next('ul[class*=recom-ul]').find('li[name=temli]:first').trigger('click', i);});	
			$('#nco-search-product').next('ul[class*=recom-ul]').find('li[name=tem_li]').remove();		
		});

		//add new contact
		$('#nco-new-contact').off('click').on('click', function() {
			openPage('add?type=contact', false, false);
		});
	
		// search products
		$('#nco-search-product').off('input').on('input', function(e, tem) {			
			if (tem) {				
				$(this).next('ul[class*=recom-ul]').append('<li name="temli"></li>');
			} else {
				var products = alasql('select item.*, kind.text from item left join kind on kind.id = item.kind_id;');
				var value = $(this).val().trim();
				var results = fuzzySearch(products, ['code', 'detail', 'maker', 'text'], value);
				var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+p.code+', '+p.detail+' ('+p.maker+', '+p.text+')<span class="glyphicon"></span></li>'});
				$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));
				if(value.length == 0 || results.length == 0) {
					$(this).next('ul[class*=recom-ul]').addClass('hide');
				}
			}

			$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function(e, id) {
				id = id ? id : $(this).attr('p-id');				
				var p = alasql('select item.*, kind.text from item left join kind on kind.id = item.kind_id where item.id = ?;', [parseInt(id)])[0];
				var tr = $('<tr pid="'+p.id+'"><td>'+p.code+'</td><td>'+p.detail+'</td><td><div><select style="width:calc(100% - 25px);display:inline;" class="form-control"></select>&nbsp;</div></td><td><input type="number" class="form-control" name="balance" style="max-width:180px;display:inline;width:calc(100% - 22px);">&nbsp;<span class="glyphicon glyphicon-remove order-remove-product" title="Remove this record." type="button" data-toggle="tooltip" data-placement="bottom"></span></td></tr>');
				tr.appendTo($('#nco-product-table').find('tbody'));
				var batches = alasql('select * from itembatch where item_id = ?;', [p.id]);
				tr.find('select').append(batches.map(function(b) {
					try {
						var amount = alasql('select * from stock where whouse_id = ? and itembatch_id = ?;', [parseInt($('#nco-whouse-select').val()), b.id])[0].balance;
						return '<option value="'+b.id+'">'+b.lot+' ('+amount+' In-stock)</option>';
					} catch(e) {
						return '<option value="'+b.id+'">'+b.lot+'</option>';
					}
				}).join('\r\n'));
				tr.find('input[name=balance]').val(0);
				tr.find('span[class*=order-remove-product]').off('click').on('click', function(){
					tr.remove();
				});
				$('#nco-search-product').val('').trigger('input');
				tooltip();
			});
		});
		
		//person contact
		$('#nco-contact-person').off('input').on('input', function(e, p1) { //p1 mean select one.
			if (p1) { // if select one
				$(this).parent().next('ul[class*=recom-ul]').empty().addClass('hide');
				return;
			}
			if ($('#nco-contact-person').attr('p-id') && $('#nco-contact-person').attr('p-id').length > 0) { //if change the content of selected one.
				$('#nco-contact-person').removeAttr('p-id').removeAttr('p-type').val('');
				$('#nco-contact-person-name, #nco-contact-person-tel, #nco-contact-person-company').val('').prop('disabled', false);
				return;
			}

			var partners = alasql('select * from partner');
			var emps = alasql('select * from emp');
			emps.forEach(function(e){e.title_rev = empTitle(e.title)});
			var value = $(this).val().trim();
			var p_res = fuzzySearch(partners, ['name','emp_num', 'company', 'title', 'tel', 'email'], value);
			var e_res = fuzzySearch(emps, ['name', 'emp_num', 'title_rev', 'tel', 'email'], value, ['our company']);
			var p_lis = p_res.map(function(p){return '<li p-id="' + p.id + '" p-type="2"> '+p.name+' ('+p.company+') '+p.title+' ('+p.emp_num+', '+p.tel+', '+p.email+')<span class="glyphicon"></span></li>'});
			var e_lis = e_res.map(function(p){return '<li p-id="' + p.id + '" p-type="1"> '+p.name+' (Our Company) '+p.title_rev+' ('+p.emp_num+', '+p.tel+', '+p.email+')<span class="glyphicon"></span></li>'});
			$(this).parent().next('ul[class*=recom-ul]').empty().removeClass('hide').append(p_lis.join('\r\n')).append(e_lis.join('\r\n'));
			if(value.length == 0 || p_lis.length + e_lis.length == 0) {
				$(this).parent().next('ul[class*=recom-ul]').addClass('hide');
			}

			$(this).parent().next('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
				var type = parseInt($(this).attr('p-type'));
				var id = $(this).attr('p-id');			
				var p = alasql('select * from ' + (type == 1 ? 'emp':'partner')  + ' where id = ?;', [parseInt(id)])[0];
				$('#nco-contact-person-name').val(p.name).prop('disabled', true);
				$('#nco-contact-person-tel').val(p.tel).prop('disabled', true);
				$('#nco-contact-person-company').val(type == 1 ? 'Our Company' : p.company).prop('disabled', true);			
				$('#nco-contact-person').attr('p-type', type).attr('p-id', id).val($(this).text()).trigger('input', [true]);
			});
		});

		// check out-of-stock risk
		function checkOutStockRisk(isExistOrder, isWarningForKeeper, isToAddMessage) {			
			var trs = $('#nco-product-table').find('tbody tr');
			var risks = trs.toArray().map(function(tr){
				var r_itembatch_id = parseInt($(tr).find('select').val());
				var r_whouse_id = parseInt($('#nco-whouse-select').val());
				var r_date = $('#nco-delivery-date').val();				
				var r_change = parseInt($(tr).find('input[type=number]').val());
				var r_res = constructPrediction(r_itembatch_id, r_whouse_id, isExistOrder?false:true, r_date, 2, false, r_change);
				var r_item = alasql('select itembatch.lot, item.code from itembatch left join item on item.id=itembatch.item_id where itembatch.id=?', [r_itembatch_id])[0];				
				if (r_res.isDanger) {
					if(isToAddMessage) {					
						DB.insertPredictionMessage(r_itembatch_id, r_whouse_id);
					}	
					if (!isWarningForKeeper) {			
						return '<span name="nco-prediction-href" phref="'+DB.constructPredicitonStr(r_itembatch_id, r_whouse_id, isExistOrder?false:true, r_date, 2, false, r_change)+
								'" style="margin-left:10px;color:#f55454;cursor:pointer;font-weight:bold">Forecast "'+r_item.code+'('+r_item.lot+')" only '+
								(isExistOrder?r_res.availableAmount:constructPrediction(r_itembatch_id, r_whouse_id, false, r_date, 2, false, r_change).availableAmount)+' left on '+
								(r_date?r_date:'"Unset Day"')+'.</span>';
					} else {						
						return '<span name="nco-prediction-href" phref="'+DB.constructPredicitonStr(r_itembatch_id, r_whouse_id, isExistOrder?false:true, r_date, 2, false, r_change)+
								'" style="margin-left:10px;color:#f55454;cursor:pointer;font-weight:bold">Forecast "'+r_item.code+'('+r_item.lot+')" is not enough.</span>';
					}									
				} else {
					return '';
				}
			}).filter(function(str){return str != '';});
			if (risks.length > 0) {
				var r_div = $('<label style="color:#ff2f2f"><span class="glyphicon glyphicon-info-sign"></span> Out-of-stock Risks:</label><br>'+risks.join('<br>'));				
				r_div.filter('span[name=nco-prediction-href]').off('click').on('click', function(){openPage($(this).attr('phref'), false, false);});
				return r_div;
			} else {
				return '';
			}
		}		

		// submit new outorder
		$('#nco-submit-outorder, #nco-submit-outorder-risk').off('click').on('click', function() {
			$('#nco-submit-outorder-risk').hide();
			$('#nco-submit-warning-risk').empty();
			$('#nco-submit-warning').text('').parent('label').parent('div').hide();
			var warning = [];
			if ($('#nco-contact-person-name').val().trim().length == 0) {
				warning.push('"Name of Contact Person" could not be empty.');
			}
			if($('#nco-product-table tbody tr').length == 0) {
				warning.push('Please select at least one product to check-out.');
			}
			if(!$('#nco-whouse-select').val()) {
				warning.push('Please select which warehouse to check-out.');
			}
			var isZeroProductitem = false;			
			$('#nco-product-table tbody tr input[name=balance]').each(function(){
				if(parseInt($(this).val()) <= 0 || parseInt($(this).val()) != parseFloat($(this).val())){
					isZeroProductitem = true;
				}
			});
			if (isZeroProductitem){warning.push('The amount of check-out product item is wrong. Please correct it.');};
			var batchitem_check = [];
			var isSameProductitem = false;
			var noProductBatch = false;
			$('#nco-product-table tbody tr select').each(function(){
				if($.inArray($(this).val(), batchitem_check) >= 0){
					isSameProductitem = true;
				} else {
					batchitem_check.push($(this).val());
				}
				if (!$(this).val()) {
					noProductBatch = true;
				}
			});
			if (isSameProductitem){warning.push('There are same product belong to the same product. Please remove redundancy.');};
			if (noProductBatch){warning.push('Please select a batch of each product.');};
			if (warning.length != 0) {
				warning.unshift('Submit Fail:');
				$('#nco-submit-warning').empty().append(warning.join('<br/>&nbsp;&nbsp;&nbsp;&nbsp;')).parent('label').parent('div').show();
				$('[name=mainbody]').filter(':visible').scrollTop($('#nco-submit-warning')[0].offsetTop);
			} else {		
				if (checkOutStockRisk() && $(this).attr('id')!='nco-submit-outorder-risk') {
					$('#nco-submit-warning-risk').empty().append(checkOutStockRisk());
					$('#nco-submit-outorder-risk').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#nco-submit-warning-risk')[0].offsetTop);
					return;
				}	
				checkOutStockRisk(false, false, true);	
				var newOrderId = DB.saveCheckoutOrder(DB.getCid(), $('#nco-contact-person-name').val(), $('#nco-contact-person-tel').val(), $('#nco-contact-person-company').val(), 
					$('#nco-contact-person').attr('p-id') ? $('#nco-contact-person').attr('p-id') : 0, $('#nco-contact-person').attr('p-type') ? $('#nco-contact-person').attr('p-type') : 0,
					$('#nco-receiver-address').val(), $('#nco-whouse-select').val(), $('#nco-reason').val(), $('#nco-outorder-comment').val(), $('#nco-delivery-date').val(), $('#nco-product-table tbody tr'));				
				addInfoMess('Check-out Application:', '<p>Create success. Wait to be approved.</p>', null, 90);
				history.replaceState('check-out-order?id='+newOrderId, null, null);
				stockPage['check-out-order'] = 'check-out-order?finish=true';
				openPage('check-out', false, false);
			};			
		});		

		if (obj.id) {
			//order detail
			var order = alasql('select * from outorder where id = ?;', [parseInt(obj.id)])[0];
			var transport = alasql('select * from transport where order_id = ? and order_type = ?;', [order.id, 2])[0];			
			var a = alasql('select * from emp where id = ?;', [order.applyer_cid])[0];
			var p = parseInt(order.buyer_type) == 1 ? alasql('select * from emp where id = ?;', [order.buyer_cid])[0] : 
					(parseInt(order.buyer_type) == 2 ? alasql('select * from partner where id = ?;', [order.buyer_cid])[0] :
														alasql('select * from tem_contact where id = ?;', [order.buyer_cid])[0]);

			$('#nco-title-order-id').val(order.id).prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');
			$('#nco-applyer').val(' '+a.name+' (Our Company) '+empTitle(a.title)+' ('+a.emp_num+', '+a.tel+', '+a.email+')').prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');
			$('#nco-apply-time').val(order.apply_time).prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');	
			if(order.buyer_type == 3) {
				$('#nco-search-contact-div').hide();
			} else {
				$('#nco-new-contact').hide();
				$('#nco-contact-person').show().val(parseInt(order.buyer_type) == 1 ? ' '+p.name+' (Our Company) '+empTitle(p.title)+' ('+p.emp_num+', '+p.tel+', '+p.email+')' : ' '+p.name+' ('+p.company+') '+p.title+' ('+p.emp_num+', '+p.tel+', '+p.email+')').prop('disabled', true).css('cursor', 'text');
			}
			$('#nco-contact-person-name').val(p.name).prop('disabled', true);
			$('#nco-contact-person-tel').val(p.tel).prop('disabled', true);
			$('#nco-contact-person-company').val(p.company).prop('disabled', true);
			$('#nco-receiver-address').val(order.buyer_name).attr('disabled', true);
			$('#nco-whouse-select').val(order.whouse_id).prop('disabled', true).css('cursor', 'text');
			$('#nco-delivery-date').val(transport.delivery_date).prop('disabled', true);
			$('#nco-reason').val(order.reason).prop('disabled', true).css('cursor', 'text');
			$('#nco-outorder-comment').val(order.comment).prop('disabled', true).css('cursor', 'text');
			$('#nco-submit-outorder,#nco-submit-outorder-risk').hide();
			//$('#nco-new-product').hide();
			$('#nco-search-product').hide();
			$('#nco-title-order-status').text(orderStatus(2, order.status));
			
			var orderItemBatches = alasql('select orderitembatch.*, item.code, item.detail, itembatch.item_id, itembatch.lot from orderitembatch join itembatch on orderitembatch.itembatch_id = itembatch.id join item on item.id = itembatch.item_id where orderitembatch.order_id = ? and orderitembatch.order_type = ?;', [order.id, 2]);					
			var trs = orderItemBatches.map(function(p){var tr = $('<tr pid="'+p.id+'"><td>'+p.code+'</td><td>'+p.detail+'</td><td><div><select style="width:calc(100% - 25px);display:inline;" class="form-control"></select>&nbsp;</div></td><td><input type="number" name="balance" class="form-control" style="max-width:180px;display:inline;width:calc(100% - 22px);">&nbsp;</td></tr>');
								var batches = alasql('select * from itembatch where item_id = ?;', [p.item_id]);
								var stock = alasql('select * from stock where whouse_id = ? and itembatch_id = ?;', [order.whouse_id, p.itembatch_id])[0];
								tr.find('select').append(batches.map(function(b){return '<option value="'+b.id+'">'+b.lot+'</option>';}).join('\r\n')).val(p.itembatch_id);
								tr.find('input[name=balance]').val(p.balance);
								tr.find('select,input').prop('disabled', true).css('cursor', 'text');
								var stock = alasql('select * from stock where itembatch_id = ? and whouse_id = ?;', [p.itembatch_id, order.whouse_id])[0];
								tr.off('click').on('click', function(){if(stock && stock.id){openPage('stock?id='+stock.id, false, false);}else{openPage('item?id='+p.item_id, false, false);}}).css('cursor', 'pointer');
								return tr;});
			$('#nco-product-table tbody').append(trs);

			// order history
			$('#nco-orderhistory-div').show();
			var orderHistory = alasql('select * from orderstatushistory where order_id = ? and order_type = ? order by orderstatushistory.id DESC;', [order.id, 2]);
			$('#nco-orderhistory-table').find('tbody').empty().append(orderHistory.map(function(i) {
				var changer = DB.findContact(i.who_cid, true);
				var $tr = $('<tr><td style="width:30%">'+i.time+'</td><td style="width:70%"><span class="glyphicon glyphicon-arrow-right"></span><span style="font-weight:bold">'+orderStatus(2, i.to_status)+'</span><br/>Changed By: <span style="text-decoration:underline;cursor:pointer" name="contact">'+changer.name+'</span> <br>Comment:&nbsp;&nbsp;&nbsp;&nbsp;'+i.comment+'</td></tr>');
				$tr.find('span[name=contact]').off('click').on('click', function(){
					openPage('contact?type=emp&id='+changer.id, false, false);
				});
				return $tr;
			}));

			//order current status			
			if (order.status >= 6) {
				$('#nco-viewprefix-transport').show().off('click').on('click', function(){$('#nco-viewprefix-transport-div').toggle()});
				var transport = alasql('select * from transport where order_type = ? and order_id = ?;', [2, order.id])[0];
				$('#nco-transport-company-view').val(transport.company);
				$('#nco-transport-num-view').val(transport.num);
				$('#nco-transport-delivery-view').val(transport.delivery_date);
				$('#nco-transport-arrival-view').val(transport.arrival_date);
			}
			if (order.status >= 5) {
				$('#nco-viewprefix-picking').show().off('click').on('click', function(){$('#nco-viewprefix-picking-div').toggle()});				
				$('#nco-picking-table-view').find('tbody').empty().append(orderItemBatches.map(function(i) {
					var picks = alasql('select * from pick where orderitembatch_id = ?;', [i.id]);
					var str = picks.map(function(p){
						var item_id = alasql('select * from itembatch where id=?', [i.itembatch_id])[0].item_id;
						return '<tr itemid="'+i.item_id+'"><td>'+i.code+'('+i.lot+')</td><td>'+p.place+'</td><td>'+p.amount+'</td></tr>'
					}).join('');														
					return $(str);
				}));
				$('#nco-picking-table-view').find('tbody tr').css('cursor', 'pointer').off('click').on('click', function(){
					openPage('item?id='+$(this).attr('itemid'), false, false);
				});
				var pickingTask = alasql('select * from task where order_id = ? and order_type = ? and task_name = ?', [order.id, 2, 'picking'])[0];
				var pickingWorker = alasql('select * from emp where id = ?;', [pickingTask.worker_cid])[0];
				$('#nco-picking-table-view tfoot tr span[name=picking-operator]').text(pickingWorker ? pickingWorker.name : '').off('click').on('click', function(){
					if (pickingWorker)
						openPage('contact?type=emp&id='+pickingWorker.id, false, false);
				});
			}


			//order update status
			$('#nco-updatestatus-div').show();
			$('#nco-update-outorder-comment').val('');
			$('#nco-updatestatus-warning').parent('label').hide();
			if (order.status == 1) {
				if (checkOutStockRisk(true, true)) {
					$('#nco-updatestatus-warning-risk').empty().append(checkOutStockRisk(true, true));
					$('#nco-update-outorder-risk').show();
					$('#nco-update-outorder').prop('disabled', true);
				}
			}
			var statusOptions = [];			
			if (order.status == 1) {
				if (DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id)))
					statusOptions.push(4,3);
			} else {
				if ( DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id))  ) {
					for (var i = order.status+1; i<=6; i++) {
						statusOptions.push(i);
					}				
				} else if (DB.getUserEmp().title == 5 && DB.isWorkerTask(2, order.id, DB.getCid())) {
					var task = DB.getWorkerTask(2, order.id, DB.getCid());
					if (task == 'picking') {
						for (var i = order.status+1; i<=5; i++) {
							statusOptions.push(i);
						}
					}				
				}
			}
			if (order.applyer_cid == DB.getCid() || DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id))) {
				statusOptions.push(2);
			}
			if (statusOptions.length <= 0) {
				$('#nco-updatestatus-div').hide();
				$('#toolkit1').hide();
			}

			//order 'next step'
			var nextStepArr = [1, 4, 5];
			if ($.inArray(order.status, nextStepArr) > -1 && $.inArray(order.status, statusOptions) > -1 &&
					(DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_id)) || (DB.getUserEmp().title == 5 && DB.isWorkerTask(2, order.id, DB.getCid())) ) ) {				
				$('#nco-nextstep-info').removeClass('hide');
				$('#nco-nextstep-info span[id*=nco-status-message]').hide();
				$('#nco-status-message-'+order.status).show();
			} else {
				$('#nco-nextstep-info').addClass('hide');
			}

			$('#nco-select-new-status').empty().append(statusOptions.map(function(o){return $('<option value='+o+' style="color:'+orderStatusColor(2, o, order.status)+'">'+orderStatus(2, o)+'</option>');})).val(order.status);
			if (order.status == 2 || order.status == 3 || order.status == 6) {
				$('#nco-updatestatus-div').hide();	
				$('#toolkit1').hide();			
			} else {	
				// Transport	
				var transport = alasql('select * from transport where order_type = ? and order_id = ?;', [2, order.id])[0];
				$('#nco-transport-company-new').val(transport.company);
				$('#nco-transport-num-new').val(transport.num);
				$('#nco-transport-delivery-new').val(transport.delivery_date);
				$('#nco-transport-arrival-new').val(transport.arrival_date);

				//task
				$('#nco-picking-cid-new').off('input').on('input', function(e, p1) {						
					if (p1) {
						$(this).next('ul[class*=recom-ul]').empty().addClass('hide');
						return;
					}
					if ($(this).attr('p-id') && $(this).attr('p-id').length > 0) {
						$(this).removeAttr('p-id').val('');
						return;
					}

					var emps = alasql('SELECT emp.* from emp left join emp_whouse on emp_whouse.emp_id = emp.id where emp_whouse.whouse_id = ? or emp.title = ?;', [order.whouse_id, 2]);
					emps.forEach(function(e){e.title_rev = empTitle(e.title)});
					var value = $(this).val().trim();
					var e_res = fuzzySearch(emps, ['name', 'emp_num', 'title_rev', 'tel', 'email'], value, ['our company']);						
					var e_lis = e_res.map(function(p){return '<li p-id="' + p.id + '"> '+p.name+' (Our Company) '+p.title_rev+' ('+p.emp_num+', '+p.tel+', '+p.email+')</li>'});
					$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(e_lis.join('\r\n'));
					if (value.length == 0 || e_lis.length == 0) {
						$(this).next('ul[class*=recom-ul]').addClass('hide');
					}

					$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
						var id = $(this).attr('p-id');				
						var p = alasql('select * from emp where id = ?;', [parseInt(id)])[0];
						$(this).parent('ul[class*=recom-ul]').prev('input').attr('p-id', id).val($(this).text()).trigger('input', [true]);
					});
				});
				$('#nco-picking-cid-new').val('test').trigger('input').val('').trigger('input');
				var pickingTask = alasql('select * from task where order_type = ? and order_id = ? and task_name = ?', [2, order.id, 'picking'])[0];
				if (pickingTask.worker_cid !== undefined) {
					$('#nco-picking-cid-new').next('ul[class*=recom-ul]').find('li[p-id='+pickingTask.worker_cid+']').trigger('click');
				}								

				//picking
				$('#nco-picking-table-new').find('tbody').empty();
				$('#nco-add-pick-record').off('click').on('click', function() {
					var tr = $('<tr><td><select name="nco-pick-itembatch" class="form-control"></select></td> <td><select name="nco-pick-place" class="form-control"></select></td>\
							 <td><input name="nco-place-input" class="form-control" style="display:inline; width: calc(100% - 20px)"><span class="glyphicon glyphicon-remove order-remove-product" title="" type="button" data-toggle="tooltip" data-placement="bottom" data-original-title="Remove this record."></span></td></tr>');
					tr.find('select[name=nco-pick-itembatch]').append(orderItemBatches.map(function(i){return $('<option value="'+i.id+'-'+i.itembatch_id+'">'+i.code+'('+i.lot+')</option>')}));
					tr.find('select[name=nco-pick-itembatch]').off('change').on('change', function() {
						var itembatch_id = parseInt($(this).parents('tr:first').find('select[name=nco-pick-itembatch]').val().split('-')[1]);
						tr.find('select[name=nco-pick-place]').empty().append(alasql('select * from place where itembatch_id = ? and whouse_id = ?;', [itembatch_id, order.whouse_id]).map(function(pla){
							if (pla.balance == 0) return $('');
							var orderItemBatch = alasql('select * from orderitembatch where id = ?;', [parseInt(tr.find('select[name=nco-pick-itembatch]').val().split('-')[0])])[0];							
							return $('<option value="'+pla.id+'">'+(pla.place?pla.place:'-')+'(AMOUNT:'+pla.balance+')</option>').off('change').on('change', function() {
								tr.find('input[name=nco-place-input]').val(0);
							}).trigger('change');
						}));
					}).trigger('change');
					tr.find('span[class*=glyphicon-remove]').off('click').on('click', function(){$(this).parents('tr:first').remove();});
					tr.appendTo($('#nco-picking-table-new').find('tbody'));
				});		
				tooltip();		
				
				// status change
				$('#nco-select-new-status').off('change').on('change', function() {
					$('#nco-newprefix-transport, #nco-newprefix-task, #nco-newprefix-picking').hide();
					$('#nco-newprefix-transport-div, #nco-newprefix-task-div, #nco-newprefix-picking-div').hide();
					if (order.status <= 5 && parseInt($(this).val()) >= 6) {
						$('#nco-newprefix-transport').show().off('click').on('click', function(){$('#nco-newprefix-transport-div').toggle()});
						$('#nco-newprefix-transport-div').show();
					}
					if (order.status <= 1 && parseInt($(this).val()) >= 4) {
						$('#nco-newprefix-task').show().off('click').on('click', function(){$('#nco-newprefix-task-div').toggle()});
						$('#nco-newprefix-task-div').show();
					}
					if (order.status <= 4 && parseInt($(this).val()) >= 5) {
						$('#nco-newprefix-picking').show().off('click').on('click', function(){$('#nco-newprefix-picking-div').toggle()});
						$('#nco-newprefix-picking-div').show();
					}
					if (order.status == 1 && checkOutStockRisk(true, true)) {
						if (parseInt($(this).val()) == 2 || parseInt($(this).val()) == 3) {
							$('#nco-update-outorder-risk').hide();
							$('#nco-update-outorder').prop('disabled', false);
						} else {
							$('#nco-update-outorder-risk').show();
							$('#nco-update-outorder').prop('disabled', true);
						}
					}					
				});
				$('#nco-select-new-status').trigger('change');
			}


			// update outorder status 
			$('#nco-update-outorder, #nco-update-outorder-risk').off('click').on('click', function() {
				$('#nco-updatestatus-warning').parent('label').hide();
				var warning = [];
				if (!$('#nco-select-new-status').val()) {
					warning.push('Must select the updated status.');
				}
				var isWrongPickForm = false;				
				var planPick = Object.create(null);
				orderItemBatches.forEach(function(o){planPick[o.id]=parseInt(o.balance);});
				$('#nco-picking-table-new').find('tbody tr input[name=nco-place-input]').each(function(){
					if ($(this).val() === null || $(this).val() === "" || $(this).val() === undefined || parseInt($(this).val()) <= 0 || parseInt($(this).val()) != parseFloat($(this).val())) {
						isWrongPickForm = true;
						return;
					}
					var itembatch_id = parseInt($(this).parents('tr:first').find('select[name=nco-pick-itembatch]').val().split('-')[1]);
					var orderitembatch_id = parseInt($(this).parents('tr:first').find('select[name=nco-pick-itembatch]').val().split('-')[0]);
					var orderItemBatch = alasql('select * from orderitembatch where id = ?;', [orderitembatch_id])[0];
					var place = alasql('select * from place where id = ?;', [parseInt($(this).parents('tr:first').find('select[name=nco-pick-place]').val())])[0];
					if ($(this).val() > Math.min(place.balance, orderItemBatch.balance)) {
						isWrongPickForm = true;
					}
					planPick[orderitembatch_id] = planPick[orderitembatch_id] - parseInt($(this).val());
				});
				for (var a in planPick) {
					if (planPick[a] != 0 && order.status <= 4 && parseInt($('#nco-select-new-status').val()) >= 5) {
						isWrongPickForm = true;
					}
				}				
				if (isWrongPickForm) {
					warning.push('The picked amount of product is wrong. Please correct it.');
				}
				var sameitem_check = [];
				var isSameProductitem = false;
				$('#nco-picking-table-new tbody tr select[name=nco-pick-itembatch]').each(function(){
					if ($.inArray($(this).val()+'-'+$(this).parents('tr:first').find('select[name=nco-pick-place]').val(), sameitem_check) >= 0) {
						isSameProductitem = true;
					} else {
						sameitem_check.push($(this).val()+'-'+$(this).parents('tr:first').find('select[name=nco-pick-place]').val());
					}
				});
				if (isSameProductitem){warning.push('There are same product belong to the same product. Please remove redundancy.');};
				if (warning.length > 0) {
					$('#nco-updatestatus-warning').empty().append('Update fail:<br>'+warning.join('<br>')).parent('label').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#nco-updatestatus-warning')[0].offsetTop);
					return;
				}
				if (checkOutStockRisk(true, true) && $(this).attr('id')!='nco-update-outorder-risk' && order.status == 1 && parseInt($('#nco-select-new-status').val())!=2 && parseInt($('#nco-select-new-status').val())!=3) {
					$('[name=mainbody]').filter(':visible').scrollTop($('#nco-updatestatus-warning-risk')[0].offsetTop);
					return;
				}
				DB.updateCheckoutOrder(order, $('#nco-select-new-status').val(), $('#nco-update-outorder-comment').val(), $('#nco-transport-company-new').val(), $('#nco-transport-num-new').val(), $('#nco-transport-delivery-new').val(), $('#nco-transport-arrival-new').val(), $('#nco-picking-cid-new').attr('p-id'), $('#nco-picking-table-new').find('tbody tr'));				
				historyBack(true, true);
				addInfoMess('Check-out order: '+order.id, '<p>Change order stauts to "'+orderStatus(2, $('#nco-select-new-status').val())+'" success.</p>', 8000, 90);
			});			
		}
	});






	$('body').on('transfer', function(e, obj){	
		if (obj.couldBack) return;

		var sql = 'SELECT transferorder.*, i_w.code as whouse_in_code, i_w.name as whouse_in_name, o_w.code as whouse_out_code, o_w.name as whouse_out_name\
					from transferorder\
					left join whouse as o_w on 	transferorder.whouse_out_id = o_w.id\
					left join whouse as i_w on 	transferorder.whouse_in_id = i_w.id;';
		var orders = alasql(sql);
		if (DB.getUserEmp().title == 4) {
			var empWhouses = alasql('select * from emp_whouse where emp_id = ?;', [DB.getCid()]).map(function(i){return i.whouse_id});
			orders = orders.filter(function(o){return $.inArray(o.whouse_out_id, empWhouses) >= 0 || $.inArray(o.whouse_in_id, empWhouses) >= 0 || o.applyer_cid == DB.getCid();});
		} else if (DB.getUserEmp().title == 5) {
			var orderIds = alasql('select * from task where order_type = ? and worker_cid = ?', [3, DB.getCid()]).map(function(i){return i.order_id});
			orders = orders.filter(function(o){return $.inArray(o.id, orderIds)>=0;});
		}
		checkEmptyResult(orders);

		var tbody = $('#lct-tbody');
		tbody.empty();
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		
		for (var i = 0; i < orders.length; i++) {			
			var order = orders[i];
			var transport = alasql('select * from transport where order_id = ? and order_type = ?;', [order.id, 3])[0];
			var tr = $('<tr data-href="transfer-order?id=' + order.id + '"></tr>');
			var applyer = alasql('select * from emp where id = ?', [order.applyer_cid])[0]; 

			tr.append('<td >' + order.id + '</td>');
			tr.append('<td >' + orderStatusLabel(3, order.status) + '</td>');
			tr.append('<td >' + order.update_time + '</td>');
			tr.append('<td pid="'+applyer.id+'">' + applyer.name + ' (' + applyer.emp_num + ') ' + empTitle(applyer.title) + '</td>');
			//tr.append('<td >' + order.apply_time + '</td>');			
			tr.append('<td >' + order.whouse_out_name + '</td>');
			tr.append('<td >' + order.whouse_in_name + '</td>');
			tr.append('<td >' + transport.delivery_date + '</td>');	
			tr.append('<td >' + transport.arrival_date + '</td>');		
		
			tr.appendTo(tbody);
		}

		function initTrClick() {			
			$('#lct-tbody > tr').css('cursor', 'pointer').off('click');
			$('#lct-tbody > tr').css('cursor', 'pointer').on('click', function() {
				openPage($(this).attr('data-href'), false, false);
			});
		}
		initTrClick();
		
		initSortTable('#list-transfer-table', initTrClick);
		initFixedTable('#list-transfer-table');	
		$('#lct-th-update-time').trigger('click').trigger('click');
	});





	$('body').on('transfer-order', function(e, obj){
		if (!transferStockRisk()) {
			$('#nct-submit-warning-risk').empty();
			$('#nct-submit-transferorder-risk').hide();
		}		
		if (obj.couldBack) return;
		$('#nct-title-order-id').val('').prop('disabled', false).parent().addClass('hide');
		$('#nct-applyer').val('').prop('disabled', false).parent().addClass('hide');
		$('#nct-apply-time').val('').prop('disabled', false).parent().addClass('hide');	
		$('#nct-whouse-in-select,#nct-whouse-out-select').val('').prop('disabled', false);
		$('#nct-delivery-date,#nct-arrival-date').val('').prop('disabled', false);			
		$('#nct-reason').val('').prop('disabled', false);
		$('#nct-transferorder-comment').val('').prop('disabled', false);
		
		//$('#nct-new-product').show();
		$('#nct-search-product').show();
		$('#nct-submit-transferorder').show(); 
		$('#nct-submit-transferorder-risk, #nct-update-transferorder-risk').hide(); //risk button
		$('#nct-title-order-status').text('Creating');
		$('#nct-product-table tbody').empty();
		$('#nct-submit-warning').text('').parent('label').parent('div').hide();
		$('#nct-submit-warning-risk, #nct-updatestatus-warning-risk').empty(); //risk warning 
		$('#nct-update-transferorder').prop('disabled', false);
		$('#nct-orderhistory-div').hide();
		$('#nct-updatestatus-div').hide();
		$('#nct-currentstatus-div').find('div[id*=nct-viewprefix]').hide();
		$('#nct-updatestatus-div').find('div[id*=nct-newprefix]').hide();
		$('#nct-nextstep-info').addClass('hide');

		// warehouse options
		var whouses = alasql('select * from whouse;');
		$('#nct-whouse-in-select,#nct-whouse-out-select').find('option').remove();		
		whouses.forEach(function(w){
			$('<option></option>').attr('value', w.id).text(w.name+' ('+w.code+')').appendTo($('#nct-whouse-in-select'));
			$('<option></option>').attr('value', w.id).text(w.name+' ('+w.code+')').appendTo($('#nct-whouse-out-select'));
		});
		$('#nct-whouse-in-select,#nct-whouse-out-select').val('');
		$('#nct-whouse-out-select').off('change').on('change', function() {			
			var pre_ids = $('#nct-product-table tbody tr').toArray().map(function(t){return parseInt($(t).attr('pid'));});
			$('#nct-product-table tbody').empty();
			$('#nct-search-product').trigger('input', true);			
			pre_ids.forEach(function(i){$('#nct-search-product').next('ul[class*=recom-ul]').find('li[name=temli]:first').trigger('click', i);});	
			$('#nct-search-product').next('ul[class*=recom-ul]').find('li[name=tem_li]').remove();		
		});
	
		// search products
		$('#nct-search-product').off('input').on('input', function(e, tem) {			
			if (tem) {		
				$(this).next('ul[class*=recom-ul]').append('<li name="temli"></li>');
			} else {
				var products = alasql('select item.*, kind.text from item left join kind on kind.id = item.kind_id;');
				var value = $(this).val().trim();
				var results = fuzzySearch(products, ['code', 'detail', 'maker', 'text'], value);
				var lis = results.map(function(p){return '<li p-id="' + p.id + '"> '+p.code+', '+p.detail+' ('+p.maker+', '+p.text+')<span class="glyphicon"></span></li>'});
				$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(lis.join('\r\n'));
				if(value.length == 0 || results.length == 0) {
					$(this).next('ul[class*=recom-ul]').addClass('hide');
				}
			}

			$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function(e, id) {				
				id = id ? id : $(this).attr('p-id');				
				var p = alasql('select item.*, kind.text from item left join kind on kind.id = item.kind_id where item.id = ?;', [parseInt(id)])[0];
				var tr = $('<tr pid="'+p.id+'"><td>'+p.code+'</td><td>'+p.detail+'</td><td><div><select style="width:calc(100% - 25px);display:inline;" class="form-control"></select>&nbsp;</div></td><td><input type="number" class="form-control" name="balance" style="max-width:180px;display:inline;width:calc(100% - 22px);">&nbsp;<span class="glyphicon glyphicon-remove order-remove-product" title="Remove this record." type="button" data-toggle="tooltip" data-placement="bottom"></span></td></tr>');
				tr.appendTo($('#nct-product-table').find('tbody'));
				var batches = alasql('select * from itembatch where item_id = ?;', [p.id]);
				tr.find('select').append(batches.map(function(b) {
					try {
						var amount = alasql('select * from stock where whouse_id = ? and itembatch_id = ?;', [parseInt($('#nct-whouse-out-select').val()), b.id])[0].balance;
						return '<option value="'+b.id+'">'+b.lot+' ('+amount+' In-stock)</option>';
					} catch(e) {
						return '<option value="'+b.id+'">'+b.lot+'</option>';
					}					
				}).join('\r\n'));
				tr.find('input[name=balance]').val(0);
				tr.find('span[class*=order-remove-product]').off('click').on('click', function(){
					tr.remove();
				});
				$('#nct-search-product').val('').trigger('input');
				tooltip();
			});
		});

		// check out-of-stock risk
		function transferStockRisk(isExistOrder, isWarningForKeeper, isToAddMessage) {
			var trs = $('#nct-product-table').find('tbody tr');
			var risks = trs.toArray().map(function(tr){
				var r_itembatch_id = parseInt($(tr).find('select').val());
				var r_whouse_id = parseInt($('#nct-whouse-out-select').val());
				var r_date = $('#nct-delivery-date').val();				
				var r_change = parseInt($(tr).find('input[type=number]').val());
				var r_res = constructPrediction(r_itembatch_id, r_whouse_id, isExistOrder?false:true, r_date, 3, false, r_change);
				var r_item = alasql('select itembatch.lot, item.code from itembatch left join item on item.id=itembatch.item_id where itembatch.id=?', [r_itembatch_id])[0];
				if (r_res.isDanger) {
					if(isToAddMessage) {
						DB.insertPredictionMessage(r_itembatch_id, r_whouse_id);
					}										
					if (!isWarningForKeeper) {				
						return '<span name="nct-prediction-href" phref="'+DB.constructPredicitonStr(r_itembatch_id, r_whouse_id, isExistOrder?false:true, r_date, 3, false, r_change)+
								'" style="margin-left:10px;color:#f55454;cursor:pointer;font-weight:bold">Forecast "'+r_item.code+'('+r_item.lot+')" only '+
								(isExistOrder?r_res.availableAmount:constructPrediction(r_itembatch_id, r_whouse_id, false, r_date, 3, false, r_change).availableAmount)+' left on '+
								(r_date?r_date:'"Unset Day"')+'.</span>';
					} else {
						return '<span name="nct-prediction-href" phref="'+DB.constructPredicitonStr(r_itembatch_id, r_whouse_id, isExistOrder?false:true, r_date, 3, false, r_change)+
								'" style="margin-left:10px;color:#f55454;cursor:pointer;font-weight:bold">Forecast "'+r_item.code+'('+r_item.lot+')" is not enough.</span>';
					}					
				} else {
					return '';
				}
			}).filter(function(str){return str != '';});
			if (risks.length > 0) {
				var r_div = $('<label style="color:#ff2f2f"><span class="glyphicon glyphicon-info-sign"></span> Out-of-stock Risks:</label><br>'+risks.join('<br>'));				
				r_div.filter('span[name=nct-prediction-href]').off('click').on('click', function(){openPage($(this).attr('phref'), false, false);});
				return r_div;
			} else {
				return '';
			}
		}
				

		// submit new transferorder
		$('#nct-submit-transferorder, #nct-submit-transferorder-risk').off('click').on('click', function() {
			$('#nct-submit-transferorder-risk').hide();
			$('#nct-submit-warning-risk').empty();
			$('#nct-submit-warning').text('').parent('label').parent('div').hide();
			var warning = [];
			if($('#nct-product-table tbody tr').length == 0) {
				warning.push('Please select at least one product to transfer.');
			}
			if(!$('#nct-whouse-in-select').val() || !$('#nct-whouse-out-select').val() || $('#nct-whouse-in-select').val() == $('#nct-whouse-out-select').val()) {
				warning.push('Please choose correct warehouses to transfer.');
			}
			var isZeroProductitem = false;			
			$('#nct-product-table tbody tr input[name=balance]').each(function(){
				if(parseInt($(this).val()) <= 0 || parseInt($(this).val()) != parseFloat($(this).val())){
					isZeroProductitem = true;
				}
			});
			if (isZeroProductitem){warning.push('The amount of transfer product item is wrong. Please correct it.');};
			var batchitem_check = [];
			var noProductBatch = false;
			var isSameProductitem = false;
			$('#nct-product-table tbody tr select').each(function(){
				if($.inArray($(this).val(), batchitem_check) >= 0){
					isSameProductitem = true;
				}else{
					batchitem_check.push($(this).val());
				}
				if (!$(this).val()) {
					noProductBatch = true;
				}
			});
			if (isSameProductitem){warning.push('There are same product belong to the same product. Please remove redundancy.');};
			if (noProductBatch){warning.push('Please select a batch of each product.');};
			if (warning.length != 0) {
				warning.unshift('Submit Fail:');
				$('#nct-submit-warning').empty().append(warning.join('<br/>&nbsp;&nbsp;&nbsp;&nbsp;')).parent('label').parent('div').show();
				$('[name=mainbody]').filter(':visible').scrollTop($('#nct-submit-warning')[0].offsetTop);
			} else {	
				if (transferStockRisk() && $(this).attr('id')!='nct-submit-transferorder-risk') {
					$('#nct-submit-warning-risk').empty().append(transferStockRisk());
					$('#nct-submit-transferorder-risk').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#nct-submit-warning-risk')[0].offsetTop);
					return;
				}	
				transferStockRisk(false, false, true);		
				var newOrderId = DB.saveTransferOrder(DB.getCid(), $('#nct-whouse-out-select').val(), $('#nct-whouse-in-select').val(), $('#nct-reason').val(), $('#nct-transferorder-comment').val(),
													 $('#nct-delivery-date').val(), $('#nct-arrival-date').val(), $('#nct-product-table tbody tr'));				
				addInfoMess('Transfer Application:', '<p>Create success. Wait to be approved.</p>', null, 90);
				history.replaceState('transfer-order?id='+newOrderId, null, null);
				stockPage['transfer-order'] = 'transfer-order?finish=true';
				openPage('transfer', false, false);
			};			
		});		

		if (obj.id) {
			//order detail
			var order = alasql('select * from transferorder where id = ?;', [parseInt(obj.id)])[0];
			var transport = alasql('select * from transport where order_id = ? and order_type = ?;', [order.id, 3])[0];			
			var a = alasql('select * from emp where id = ?;', [order.applyer_cid])[0];			

			$('#nct-title-order-id').val(order.id).prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');
			$('#nct-applyer').val(' '+a.name+' (Our Company) '+empTitle(a.title)+' ('+a.emp_num+', '+a.tel+', '+a.email+')').prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');
			$('#nct-apply-time').val(order.apply_time).prop('disabled', true).css('cursor', 'text').parent().removeClass('hide');				
			$('#nct-whouse-out-select').val(order.whouse_out_id).prop('disabled', true).css('cursor', 'text');
			$('#nct-whouse-in-select').val(order.whouse_in_id).prop('disabled', true).css('cursor', 'text');
			$('#nct-delivery-date').val(transport.delivery_date).prop('disabled', true);
			$('#nct-arrival-date').val(transport.arrival_date).prop('disabled', true);
			$('#nct-reason').val(order.reason).prop('disabled', true).css('cursor', 'text');
			$('#nct-transferorder-comment').val(order.comment).prop('disabled', true).css('cursor', 'text');
			$('#nct-submit-transferorder, #nct-submit-transferorder-risk').hide();
			//$('#nct-new-product').hide();
			$('#nct-search-product').hide();
			$('#nct-title-order-status').text(orderStatus(3, order.status));
			
			var orderItemBatches = alasql('select orderitembatch.*, item.code, item.detail, itembatch.item_id, itembatch.lot from orderitembatch join itembatch on orderitembatch.itembatch_id = itembatch.id join item on item.id = itembatch.item_id where orderitembatch.order_id = ? and orderitembatch.order_type = ?;', [order.id, 3]);					
			var trs = orderItemBatches.map(function(p){var tr = $('<tr pid="'+p.id+'"><td>'+p.code+'</td><td>'+p.detail+'</td><td><div><select style="width:calc(100% - 25px);display:inline;" class="form-control"></select>&nbsp;</div></td><td><input type="number" name="balance" class="form-control" style="max-width:180px;display:inline;width:calc(100% - 22px);">&nbsp;</td></tr>');
								var batches = alasql('select * from itembatch where item_id = ?;', [p.item_id]);
								var stock = alasql('select * from stock where whouse_id = ? and itembatch_id = ?;', [order.whouse_out_id, p.itembatch_id])[0];
								tr.find('select').append(batches.map(function(b){return '<option value="'+b.id+'">'+b.lot+'</option>';}).join('\r\n')).val(p.itembatch_id);
								tr.find('input[name=balance]').val(p.balance);
								tr.find('select,input').prop('disabled', true).css('cursor', 'text');								
								tr.off('click').on('click', function(){if(p && p.itembatch_id){openPage('item?id='+p.item_id, false, false);}}).css('cursor', 'pointer');
								return tr;});
			$('#nct-product-table tbody').append(trs);

			// order history
			$('#nct-orderhistory-div').show();
			var orderHistory = alasql('select * from orderstatushistory where order_id = ? and order_type = ? order by orderstatushistory.id DESC;', [order.id, 3]);
			$('#nct-orderhistory-table').find('tbody').empty().append(orderHistory.map(function(i) {
				var changer = DB.findContact(i.who_cid, true);
				var $tr = $('<tr><td style="width:30%">'+i.time+'</td><td style="width:70%"><span class="glyphicon glyphicon-arrow-right"></span><span style="font-weight:bold">'+orderStatus(3, i.to_status)+'</span><br/>Changed By: <span style="text-decoration:underline;cursor:pointer" name="contact">'+changer.name+'</span> <br>Comment:&nbsp;&nbsp;&nbsp;&nbsp;'+i.comment+'</td></tr>');
				$tr.find('span[name=contact]').off('click').on('click', function(){
					openPage('contact?type=emp&id='+changer.id, false, false);
				});
				return $tr;
			}));			

			//order current status	
			if (order.status >= 5) {
				$('#nct-viewprefix-picking').show().off('click').on('click', function(){$('#nct-viewprefix-picking-div').toggle()});				
				$('#nct-picking-table-view').find('tbody').empty().append(orderItemBatches.map(function(i) {
					var picks = alasql('select * from pick where orderitembatch_id = ?;', [i.id]);
					var str = picks.map(function(p){
						var item_id = alasql('select * from itembatch where id=?', [i.itembatch_id])[0].item_id;
						return '<tr itemid="'+item_id+'"><td>'+i.code+'('+i.lot+')</td><td>'+p.place+'</td><td>'+p.amount+'</td></tr>'
					}).join('');														
					return $(str);
				}));
				$('#nct-picking-table-view').find('tbody tr').css('cursor', 'pointer').off('click').on('click', function(){
					openPage('item?id='+$(this).attr('itemid'), false, false);
				});
				var pickingTask = alasql('select * from task where order_id = ? and order_type = ? and task_name = ?', [order.id, 3, 'picking'])[0];
				var pickingWorker = alasql('select * from emp where id = ?;', [pickingTask.worker_cid])[0];
				$('#nct-picking-table-view tfoot tr span[name=picking-operator]').text(pickingWorker ? pickingWorker.name : '').off('click').on('click', function(){
					if (pickingWorker)
						openPage('contact?type=emp&id='+pickingWorker.id, false, false);
				});
			}		
			if (order.status >= 6) {
				$('#nct-viewprefix-transport').show().off('click').on('click', function(){$('#nct-viewprefix-transport-div').toggle()});
				var transport = alasql('select * from transport where order_type = ? and order_id = ?;', [3, order.id])[0];
				$('#nct-transport-company-view').val(transport.company);
				$('#nct-transport-num-view').val(transport.num);
				$('#nct-transport-delivery-view').val(transport.delivery_date);
				$('#nct-transport-arrival-view').val(transport.arrival_date);
			}
			if (order.status >= 8) {
				$('#nct-viewprefix-inspection').show().off('click').on('click', function(){$('#nct-viewprefix-inspection-div').toggle()});
				$('#nct-inspection-table-view').find('tbody').empty().append(orderItemBatches.map(function(i){
					var item_id = alasql('select * from itembatch where id=?', [i.itembatch_id])[0].item_id;
					return $('<tr itemid="'+item_id+'"><td>'+i.code+'</td><td>'+i.lot+'</td><td>'+i.balance+'</td><td>'+ i.actual_balance +'</td></tr>');
				}));
				$('#nct-inspection-table-view').find('tbody tr').css('cursor', 'pointer').off('click').on('click', function(){
					openPage('item?id='+$(this).attr('itemid'), false, false);
				});
				var inspectionTask = alasql('select * from task where order_id = ? and order_type = ? and task_name = ?', [order.id, 3, 'inspection'])[0];
				var inspectionWorker = alasql('select * from emp where id = ?;', [inspectionTask.worker_cid])[0];
				$('#nct-inspection-table-view tfoot tr span[name=inspection-operator]').text(inspectionWorker ? inspectionWorker.name : '').off('click').on('click', function(){
					if (inspectionWorker)
						openPage('contact?type=emp&id='+inspectionWorker.id, false, false);
				});
			}
			if (order.status >= 9) {
				$('#nct-viewprefix-placing').show().off('click').on('click', function(){$('#nct-viewprefix-placing-div').toggle()});
				$('#nct-placing-table-view').find('tbody').empty().append(orderItemBatches.map(function(i){
					var item_id = alasql('select * from itembatch where id=?', [i.itembatch_id])[0].item_id;
					return $('<tr><td>'+i.code+'</td><td>'+i.lot+'</td><td>'+i.place_in+'</td></tr>');
				}));
				$('#nct-placing-table-view').find('tbody tr').css('cursor', 'pointer').off('click').on('click', function(){
					openPage('item?id='+$(this).attr('itemid'), false, false); 
				});
				var placingTask = alasql('select * from task where order_id = ? and order_type = ? and task_name = ?', [order.id, 3, 'placing'])[0];
				var placingWorker = alasql('select * from emp where id = ?;', [placingTask.worker_cid])[0];
				$('#nct-placing-table-view tfoot tr span[name=placing-operator]').text(placingWorker ? placingWorker.name : '').off('click').on('click', function(){
					if (placingWorker)
						openPage('contact?type=emp&id='+placingWorker.id, false, false);
				});
			}
			
			//order update status
			$('#nct-updatestatus-div').show();
			$('#nct-update-transferorder-comment').val('');
			$('#nct-updatestatus-warning').parent('label').hide();
			if (order.status == 1) {
				if (transferStockRisk(true, true)) {
					$('#nct-updatestatus-warning-risk').empty().append(transferStockRisk(true, true));
					$('#nct-update-transferorder-risk').show();
					$('#nct-update-transferorder').prop('disabled', true);
				}
			}
			var statusOptions = [];			
			if (order.status == 1) {
				if (DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_out_id)))
					statusOptions.push(4,3);
			} else {
				if ( DB.getUserEmp().title == 2 ) {
					for (var i = order.status+1; i<=9; i++) {
						statusOptions.push(i);
					}				
				} else if ( DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_out_id) ) {
					for (var i = order.status+1; i<=6; i++) {
						statusOptions.push(i);
					}				
				} else if ( DB.getUserEmp().title == 4 && DB.keeperPriorityWhouse(order.whouse_in_id) && order.status >= 6) {
					for (var i = Math.max(order.status+1, 7); i<=9; i++) {
						statusOptions.push(i);
					}				
				} else if ( DB.getUserEmp().title == 5 && DB.isWorkerTask(3, order.id, DB.getCid())  ) {
					var tasks = DB.getWorkerAllTask(3, order.id, DB.getCid());
					tasks.forEach(function(task){
						if (task == 'picking') {
							for (var i = order.status+1; i<=5; i++) {
								if ($.inArray(i, statusOptions) < 0) {
									statusOptions.push(i);
								}
							}
						} else if (task == 'inspection') {
							for (var i = order.status+1; i<=8; i++) {
								if ($.inArray(i, statusOptions) < 0) {
									statusOptions.push(i);
								}
							}
						} else if (task == 'placing') {
							for (var i = order.status+1; i<=9; i++) {
								if ($.inArray(i, statusOptions) < 0) {
									statusOptions.push(i);
								}
							}
						}
					});					
				}
			}
			if (order.applyer_cid == DB.getCid() || DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && (DB.keeperPriorityWhouse(order.whouse_out_id) || DB.keeperPriorityWhouse(order.whouse_in_id)) )) {
				statusOptions.push(2);
			}
			if (statusOptions.length <= 0) {
				$('#nct-updatestatus-div').hide();
				$('#toolkit1').hide();				
			}

			//order 'next step'
			var nextStepArr = [1, 4, 5, 6, 7, 8];
			if ($.inArray(order.status, nextStepArr) > -1 && $.inArray(order.status, statusOptions) > -1 &&
					(DB.getUserEmp().title == 2 || (DB.getUserEmp().title == 4 && (DB.keeperPriorityWhouse(order.whouse_out_id) || DB.keeperPriorityWhouse(order.whouse_in_id))) || (DB.getUserEmp().title == 5 && DB.isWorkerTask(3, order.id, DB.getCid())) ) ) {				
				$('#nct-nextstep-info').removeClass('hide');
				$('#nct-nextstep-info span[id*=nct-status-message]').hide();
				$('#nct-status-message-'+order.status).show();
			} else {
				$('#nct-nextstep-info').addClass('hide');
			}

			$('#nct-select-new-status').empty().append(statusOptions.map(function(o){return $('<option value='+o+' style="color:'+orderStatusColor(3, o, order.status)+'">'+orderStatus(3, o)+'</option>');})).val(order.status);
			if (order.status == 2 || order.status == 3 || order.status == 9) {
				$('#nct-updatestatus-div').hide();	
				$('#toolkit1').hide();					
			} else {	
				// Transport	
				var transport = alasql('select * from transport where order_type = ? and order_id = ?;', [3, order.id])[0];
				$('#nct-transport-company-new').val(transport.company);
				$('#nct-transport-num-new').val(transport.num);
				$('#nct-transport-delivery-new').val(transport.delivery_date);
				$('#nct-transport-arrival-new').val(transport.arrival_date);

				//task 
				$('#nct-picking-cid-new').off('input').on('input', function(e, p1) {						
					if (p1) {
						$(this).next('ul[class*=recom-ul]').empty().addClass('hide');
						return;
					}
					if ($(this).attr('p-id') && $(this).attr('p-id').length > 0) {
						$(this).removeAttr('p-id').val('');
						return;
					}

					var emps = alasql('SELECT emp.* from emp left join emp_whouse on emp_whouse.emp_id = emp.id where emp_whouse.whouse_id = ? or emp.title = ?;', [order.whouse_out_id, 2]);
					emps.forEach(function(e){e.title_rev = empTitle(e.title)});
					var value = $(this).val().trim();
					var e_res = fuzzySearch(emps, ['name', 'emp_num', 'title_rev', 'tel', 'email'], value, ['our company']);						
					var e_lis = e_res.map(function(p){return '<li p-id="' + p.id + '"> '+p.name+' (Our Company) '+p.title_rev+' ('+p.emp_num+', '+p.tel+', '+p.email+')</li>'});
					$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(e_lis.join('\r\n'));
					if (value.length == 0 || e_lis.length == 0) {
						$(this).next('ul[class*=recom-ul]').addClass('hide');
					}

					$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
						var id = $(this).attr('p-id');				
						var p = alasql('select * from emp where id = ?;', [parseInt(id)])[0];
						$(this).parent('ul[class*=recom-ul]').prev('input').attr('p-id', id).val($(this).text()).trigger('input', [true]);
					});
				});
				$('#nct-picking-cid-new').val('test').trigger('input').val('').trigger('input');
				var pickingTask = alasql('select * from task where order_type = ? and order_id = ? and task_name = ?', [3, order.id, 'picking'])[0];
				if (pickingTask.worker_cid !== undefined) {
					$('#nct-picking-cid-new').next('ul[class*=recom-ul]').find('li[p-id='+pickingTask.worker_cid+']').trigger('click');
				}	

				$('#nct-inspection-cid-new, #nct-placing-cid-new').off('input').on('input', function(e, p1) {						
					if (p1) {
						$(this).next('ul[class*=recom-ul]').empty().addClass('hide');
						return;
					}
					if ($(this).attr('p-id') && $(this).attr('p-id').length > 0) {
						$(this).removeAttr('p-id').val('');
						return;
					}

					var emps = alasql('SELECT emp.* from emp left join emp_whouse on emp_whouse.emp_id = emp.id where emp_whouse.whouse_id = ? or emp.title = ?;', [order.whouse_in_id, 2]);
					emps.forEach(function(e){e.title_rev = empTitle(e.title)});
					var value = $(this).val().trim();
					var e_res = fuzzySearch(emps, ['name', 'emp_num', 'title_rev', 'tel', 'email'], value, ['our company']);						
					var e_lis = e_res.map(function(p){return '<li p-id="' + p.id + '"> '+p.name+' (Our Company) '+p.title_rev+' ('+p.emp_num+', '+p.tel+', '+p.email+')</li>'});
					$(this).next('ul[class*=recom-ul]').empty().removeClass('hide').append(e_lis.join('\r\n'));
					if (value.length == 0 || e_lis.length == 0) {
						$(this).next('ul[class*=recom-ul]').addClass('hide');
					}

					$(this).next('ul[class*=recom-ul]').find('li').off('click').on('click', function() {
						var id = $(this).attr('p-id');				
						var p = alasql('select * from emp where id = ?;', [parseInt(id)])[0];
						$(this).parent('ul[class*=recom-ul]').prev('input').attr('p-id', id).val($(this).text()).trigger('input', [true]);
					});
				});
				$('#nct-inspection-cid-new, #nct-placing-cid-new').val('test').trigger('input').val('').trigger('input');
				var inspectionTask = alasql('select * from task where order_type = ? and order_id = ? and task_name = ?', [3, order.id, 'inspection'])[0];
				var placingTask = alasql('select * from task where order_type = ? and order_id = ? and task_name = ?', [3, order.id, 'placing'])[0];
				if (inspectionTask.worker_cid !== undefined) {
					$('#nct-inspection-cid-new').next('ul[class*=recom-ul]').find('li[p-id='+inspectionTask.worker_cid+']').trigger('click');
				}
				if (placingTask.worker_cid !== undefined) {
					$('#nct-placing-cid-new').next('ul[class*=recom-ul]').find('li[p-id='+placingTask.worker_cid+']').trigger('click');
				}

				//picking
				$('#nct-picking-table-new').find('tbody').empty();
				$('#nct-add-pick-record').off('click').on('click', function() {
					var tr = $('<tr><td><select name="nct-pick-itembatch" class="form-control"></select></td> <td><select name="nct-pick-place" class="form-control"></select></td>\
							 <td><input name="nct-place-input" class="form-control" style="display:inline; width: calc(100% - 20px)"><span class="glyphicon glyphicon-remove order-remove-product" title="" type="button" data-toggle="tooltip" data-placement="bottom" data-original-title="Remove this record."></span></td></tr>');
					tr.find('select[name=nct-pick-itembatch]').append(orderItemBatches.map(function(i){return $('<option value="'+i.id+'-'+i.itembatch_id+'">'+i.code+'('+i.lot+')</option>')}));
					tr.find('select[name=nct-pick-itembatch]').off('change').on('change', function() {
						var itembatch_id = parseInt($(this).parents('tr:first').find('select[name=nct-pick-itembatch]').val().split('-')[1]);
						tr.find('select[name=nct-pick-place]').empty().append(alasql('select * from place where itembatch_id = ? and whouse_id = ?;', [itembatch_id, order.whouse_out_id]).map(function(pla){
							if (pla.balance == 0) return $('');
							var orderItemBatch = alasql('select * from orderitembatch where id = ?;', [parseInt(tr.find('select[name=nct-pick-itembatch]').val().split('-')[0])])[0];							
							return $('<option value="'+pla.id+'">'+(pla.place?pla.place:'-')+'(AMOUNT:'+pla.balance+')</option>').off('change').on('change', function() {																							
								tr.find('input[name=nct-place-input]').val(0);
							}).trigger('change');
						}));
					}).trigger('change');
					tr.find('span[class*=glyphicon-remove]').off('click').on('click', function(){$(this).parents('tr:first').remove();});
					tr.appendTo($('#nct-picking-table-new').find('tbody'));				
				});		
				tooltip();	

				//inspection
				$('#nct-inspection-table-new').find('tbody').empty().append(orderItemBatches.map(function(i){
					var tr = $('<tr pid="'+i.id+'"><td>'+i.code+'</td><td>'+i.lot+'</td><td>'+i.balance+'</td><td><input type="number" name="act-num"></td></tr>');
					tr.find('input[name=act-num]').val(i.actual_balance);
					return tr;
				}));					

				//placing
				$('#nct-placing-table-new').find('tbody').empty().append(orderItemBatches.map(function(i){
					var tr = $('<tr pid="'+i.id+'"><td>'+i.code+'</td><td>'+i.lot+'</td><td><input name="place-input"></td></tr>');
					tr.find('input[name=place-input]').val(i.place_in);
					return tr;
				}));	
					
				
				// status change
				$('#nct-select-new-status').off('change').on('change', function() {
					$('#nct-newprefix-transport, #nct-newprefix-picking-task, #nct-newprefix-placing-task, #nct-newprefix-picking, #nct-newprefix-inspection, #nct-newprefix-placing').hide();
					$('#nct-newprefix-transport-div, #nct-newprefix-picking-task-div, #nct-newprefix-placing-task-div, #nct-newprefix-picking-div, #nct-newprefix-inspection-div, #nct-newprefix-placing-div').hide();
					if (order.status <= 1 && parseInt($(this).val()) >= 4) {
						$('#nct-newprefix-picking-task').show().off('click').on('click', function(){$('#nct-newprefix-picking-task-div').toggle()});
						$('#nct-newprefix-picking-task-div').show();
					}
					if (order.status <= 4 && parseInt($(this).val()) >= 5) {
						$('#nct-newprefix-picking').show().off('click').on('click', function(){$('#nct-newprefix-picking-div').toggle()});
						$('#nct-newprefix-picking-div').show();
					}
					if (order.status <= 5 && parseInt($(this).val()) >= 6) {
						$('#nct-newprefix-transport').show().off('click').on('click', function(){$('#nct-newprefix-transport-div').toggle()});
						$('#nct-newprefix-transport-div').show();
					}
					if (order.status <= 6 && parseInt($(this).val()) >= 7) {
						$('#nct-newprefix-placing-task').show().off('click').on('click', function(){$('#nct-newprefix-placing-task-div').toggle()});
						$('#nct-newprefix-placing-task-div').show();
					}
					if (order.status <= 7 && parseInt($(this).val()) >= 8) {
						$('#nct-newprefix-inspection').show().off('click').on('click', function(){$('#nct-newprefix-inspection-div').toggle()});
						$('#nct-newprefix-inspection-div').show();
					}
					if (order.status <= 8 && parseInt($(this).val()) >= 9) {
						$('#nct-newprefix-placing').show().off('click').on('click', function(){$('#nct-newprefix-placing-div').toggle()});
						$('#nct-newprefix-placing-div').show();
					}
					if (order.status == 1 && transferStockRisk(true, true)) {
						if (parseInt($(this).val()) == 2 || parseInt($(this).val()) == 3) {
							$('#nct-update-transferorder-risk').hide();
							$('#nct-update-transferorder').prop('disabled', false);
						} else {
							$('#nct-update-transferorder-risk').show();
							$('#nct-update-transferorder').prop('disabled', true);
						}
					}	
				});
				$('#nct-select-new-status').trigger('change');
			}


			// update transferorder status
			$('#nct-update-transferorder, #nct-update-transferorder-risk').off('click').on('click', function() {
				$('#nct-updatestatus-warning').parent('label').hide();
				var warning = [];

				if (!$('#nct-select-new-status').val()) {
					warning.push('Must select the updated status.');
				}

				//pick
				var isWrongPickForm = false;				
				var planPick = Object.create(null);
				orderItemBatches.forEach(function(o){planPick[o.id]=parseInt(o.balance);});
				$('#nct-picking-table-new').find('tbody tr input[name=nct-place-input]').each(function(){
					if ($(this).val() === null || $(this).val() === "" || $(this).val() === undefined || parseInt($(this).val()) <= 0 || parseInt($(this).val()) != parseFloat($(this).val())) {
						isWrongPickForm = true;
						return;
					}
					var itembatch_id = parseInt($(this).parents('tr:first').find('select[name=nct-pick-itembatch]').val().split('-')[1]);
					var orderitembatch_id = parseInt($(this).parents('tr:first').find('select[name=nct-pick-itembatch]').val().split('-')[0]);
					var orderItemBatch = alasql('select * from orderitembatch where id = ?;', [orderitembatch_id])[0];
					var place = alasql('select * from place where id = ?;', [parseInt($(this).parents('tr:first').find('select[name=nct-pick-place]').val())])[0];
					if ($(this).val() > Math.min(place.balance, orderItemBatch.balance)) {
						isWrongPickForm = true;
					}
					planPick[orderitembatch_id] = planPick[orderitembatch_id] - parseInt($(this).val());
				});
				for (var a in planPick) {
					if (planPick[a] != 0 && order.status <= 4 && parseInt($('#nct-select-new-status').val()) >= 5) {
						isWrongPickForm = true;
					}
				}				
				if (isWrongPickForm) {
					warning.push('The picked amount of product is wrong. Please correct it.');
				}
				var sameitem_check = [];
				var isSameProductitem = false;
				$('#nct-picking-table-new tbody tr select[name=nct-pick-itembatch]').each(function(){
					if ($.inArray($(this).val()+'-'+$(this).parents('tr:first').find('select[name=nct-pick-place]').val(), sameitem_check) >= 0) {
						isSameProductitem = true;
					} else {
						sameitem_check.push($(this).val()+'-'+$(this).parents('tr:first').find('select[name=nct-pick-place]').val());
					}
				});
				if (isSameProductitem){warning.push('There are some products belong to same places in picking. Please remove redundancy.');};

				//inspection
				var isWrongActualNumForm = false;
				$('#nct-inspection-table-new').find('tbody tr input[name=act-num]').each(function(){
					if ($(this).val() === null || $(this).val() === "" || $(this).val() === undefined || parseInt($(this).val()) <= 0 || parseInt($(this).val()) != parseFloat($(this).val())) {
						isWrongActualNumForm = true;
					}
				})
				if (isWrongActualNumForm) {
					warning.push('The actual amount of product is in wrong form. Please correct it.');
				}

				if (warning.length > 0) {
					$('#nct-updatestatus-warning').empty().append('Update fail:<br>'+warning.join('<br>')).parent('label').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#nct-updatestatus-warning')[0].offsetTop);
					return;
				}
				if (transferStockRisk(true, true) && $(this).attr('id')!='nct-update-transferorder-risk' && order.status == 1 && parseInt($('#nct-select-new-status').val())!=2 && parseInt($('#nct-select-new-status').val())!=3) {
					$('[name=mainbody]').filter(':visible').scrollTop($('#nct-updatestatus-warning-risk')[0].offsetTop);
					return;
				}
				DB.updateTransferOrder(order, $('#nct-select-new-status').val(), $('#nct-update-transferorder-comment').val(), $('#nct-transport-company-new').val(), $('#nct-transport-num-new').val(), $('#nct-transport-delivery-new').val(), $('#nct-transport-arrival-new').val(), 
										$('#nct-picking-cid-new').attr('p-id'), $('#nct-inspection-cid-new').attr('p-id'), $('#nct-placing-cid-new').attr('p-id'), $('#nct-picking-table-new').find('tbody tr'), $('#nct-inspection-table-new').find('tbody tr'), $('#nct-placing-table-new').find('tbody tr'));				
				historyBack(true, true);
				addInfoMess('Transfer order: '+order.id, '<p>Change order stauts to "'+orderStatus(3, $('#nct-select-new-status').val())+'" success.</p>', 8000, 90);
			});			
		}
	});



	$('body').on('list-stock', function(e, obj){		
		if (obj.couldBack) return;

		//$('#global-search-bar-div').addClass('hide');

		var sql = 'SELECT stock.id, stock.whouse_id, whouse.name, kind.text, item.code, item.maker, item.detail, itembatch.lot, itembatch.cost, stock.balance, item.unit \
			FROM stock \
			JOIN whouse ON whouse.id = stock.whouse_id \
			JOIN itembatch ON stock.itembatch_id = itembatch.id \
			JOIN item ON item.id = itembatch.item_id \
			JOIN kind ON kind.id = item.kind_id;'

		// send query
		var stocks = alasql(sql);
		if (DB.getUserEmp().title > 4) {
			stocks = stocks.filter(function(s){return DB.keeperPriorityWhouse(s.whouse_id);});
		}

		// build html table
		var tbody = $('#l-tbody-stocks');
		tbody.empty();
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		for (var i = 0; i < stocks.length; i++) {
			var stock = stocks[i];
			var tr = $('<tr data-href="stock?id=' + stock.id + '"></tr>');
			tr.append('<td >' + stock.name + '</td>');
			tr.append('<td >' + stock.text + '</td>');
			tr.append('<td >' + stock.code + '</td>');
			tr.append('<td >' + stock.maker + '</td>');
			tr.append('<td >' + stock.detail + '</td>');
			tr.append('<td >' + stock.lot + '</td>');
			tr.append('<td sv="' + stock.cost + '" style="text-align: right;">' + secret(numberWithCommas(stock.cost)) + '</td>');
			tr.append('<td style="text-align: right;">' + stock.balance + '</td>');
			tr.append('<td >' + stock.unit + '</td>');
			tr.appendTo(tbody);
		}

		function initTrClick() {			
			$('#l-tbody-stocks > tr').css('cursor', 'pointer').off('click');
			$('#l-tbody-stocks > tr').css('cursor', 'pointer').on('click', function() {
				openPage($(this).attr('data-href'), false, false);
			});
		}
		initTrClick();
		
		initSortTable('#list-stock-table', initTrClick);
		initFixedTable('#list-stock-table');			
	});

	$('body').on('stock', function(e, obj){
		if (obj.couldBack) return;
		// get id
		var id = parseInt(obj.id);
		$("input[name=id]").val(id);
		// read item data
		var sql = 'SELECT item.id, whouse.name, item.code, item.maker, item.detail, item.unit, kind.text, stock.balance, stock.whouse_id, stock.id as stock_id, stock.itembatch_id, stock.min_balance, itembatch.cost, itembatch.cost_unit, itembatch.lot, itembatch.expiration_date, itembatch.deadline_date \
			FROM stock \
			JOIN whouse ON whouse.id = stock.whouse_id \
			JOIN itembatch ON stock.itembatch_id = itembatch.id \
			JOIN item ON item.id = itembatch.item_id \
			JOIN kind ON kind.id = item.kind_id \
			WHERE stock.id = ?';
		var row = alasql(sql, [ id ])[0];

		//stock detail
		$('#stock-history-table-div *').show();
		$('#s-stock-preditcion').parents('tr:first').show();
		$('#s-code').text(row.code);
		$('#s-detail').text(row.detail);
		$('#s-maker').text(row.maker);
		$('#s-kind').text(row.text);
		$('#s-unit').text(row.unit);
		$('#s-balance').text(row.balance);
		$('#s-whouse').text(row.name);
		$('#s-itembatch-lot').text(row.lot);		
		$('#s-price').empty().append(secret((row.cost == 0 ? '-':numberWithCommas(row.cost))+' <sub>'+row.cost_unit+'</sub>'));
		$('#s-itembatch-expire').text(row.expiration_date);
		$('#s-itembatch-deadline').text(row.deadline_date);		
		var editMinStock = function() {
			var td = $(this).parents('td:first');
			var preValue = td.text();
			preValue = isNaN(parseInt(preValue)) ? 0 : parseInt(preValue);
			td.empty().append('<input type="number" style="max-width: 60px;"> <span class="glyphicon glyphicon-ok edit-span" type="button" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Save."></span>');			
			td.find('input').val(parseInt(preValue));
			tooltip();
			td.find('span[class*=glyphicon-ok]').off('click').on('click', function() {
				var newValue = td.find('input').val();
				if (isNaN(newValue) || newValue <= 0 || parseInt(newValue) != parseFloat(newValue)) {
					newValue = 0;
				} else {
					newValue = parseInt(newValue);
				}
				alasql('update stock set min_balance = ? where id = ?;', [newValue, row.stock_id]);
				alasql('select * from stock').forEach(function(s) {
					DB.insertMinimumMessage(s.id);			
				});
				row.min_balance = newValue;
				td.empty().append((row.min_balance?row.min_balance:'-')+'<span> &nbsp;</span><span name="s-min-stock-alert" class="glyphicon glyphicon-pencil edit-span" type="button" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Set minimum in-stock amount for alert."></span>');
				$('#s-stock-inshort-alert span[name=s-min-stock-alert]').off('click').on('click', editMinStock);
				tooltip();
			});
		}
		$('#s-stock-inshort-alert').empty().append((row.min_balance?row.min_balance:'-')+'<span> &nbsp;</span><span name="s-min-stock-alert" class="glyphicon glyphicon-pencil edit-span" type="button" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Set minimum in-stock amount for alert."></span>');		
		$('#s-stock-inshort-alert span[name=s-min-stock-alert]').off('click').on('click', editMinStock);
		$('#s-stock-preditcion').off('click').on('click', function(){
			openPage('prediction?itembatch_id='+row.itembatch_id+'&whouse_id='+row.whouse_id, false, false);
		});
		if(DB.getUserEmp().title >= 5 || (DB.getUserEmp().title == 4 && !DB.keeperPriorityWhouse(row.whouse_id))) {
			$('#s-stock-inshort-alert span[name=s-min-stock-alert]').remove();
			if (DB.getUserEmp().title >= 5) {
				$('#s-stock-preditcion').parents('tr:first').hide();
			}
		}
		tooltip();

		// blue block
		$('#s-blueblock-amount').text(row.balance);
		$('#s-blueblock-whouse').text(row.name);
		var places = alasql('select * from place where whouse_id = ? and itembatch_id = ?;',[row.whouse_id, row.itembatch_id]);		
		$('#s-blueblock-place-table tbody').empty().append(places.map(function(p){
			if(p.balance > 0) {
				return $('<tr><td>'+(p.place?p.place:'-')+'</td><td>'+p.balance+'</td></tr>')
			} else {
				return $('');
			}
		}));
		if ($('#s-blueblock-place-table tbody tr').toArray().length == 0) {
			$('#s-blueblock-place-table tbody').append('<tr><td colspan="100%">No result.</td></tr>')
		}
		
		// title
		$('#s-title-productname a').text(row.detail).off('click').on('click',function(){openPage('item?id='+row.id, false, false)});
		$('#s-title-productbatchname span').text(row.lot);
		$('#s-title-stock-warehouse a').text(row.name).off('click').on('click',function(){openPage('whouse?id='+row.whouse_id, false, false)});
		$('#s-title-back').off('click').on('click', function(){historyBack();});

		// transaction history		
		var rows = alasql('SELECT * FROM trans WHERE stock_id = ?', [ id ]);
		if (DB.getUserEmp().title >= 5 || (DB.getUserEmp().title == 4 && !DB.keeperPriorityWhouse(row.whouse_id))) {
			$('#stock-history-table-div *').hide();
		}
		var tbody = $('#s-tbody-transs');
		tbody.empty();
		rows.forEach(function(r) {
			var tr = $('<tr></tr>').appendTo(tbody);
			tr.append('<td>' + r.date + '</td>');
			tr.append('<td>' + (r.qty > 0 ? '+'+r.qty : ''+r.qty)  + '</td>');
			tr.append('<td>' + r.balance + '</td>');
			tr.append('<td>' + r.memo + '</td>');
			var orderStr = '<td ptype="'+r.order_type+'" pid="'+r.order_id+'"><a style="cursor:pointer" name="s-open-order">'+getOrderDisStr(r.order_type, r.order_id)+'</a></td>';			
			var orderTd = $(orderStr);			
			tr.append(orderTd);
		});
		var initTrClick = function() {			
			$('#s-tbody-transs > tr > td  a[name=s-open-order]').css('cursor', 'pointer').off('click').on('click', function() {
				var td = $(this).parents('td:first');
				openPage(getPageName(td.attr('ptype'), td.attr('pid')), false, false);
			});
		}
		initTrClick();
		initSortTable('#stock-history-table', initTrClick);		
	});


	$('body').on('list-whouse', function(e, obj){		
		if (obj.couldBack) return;

		var sql = 'SELECT * from whouse;'
		var prefix = 'lwh';	
		var detailPage = 'whouse';
		
		var results = alasql(sql);		
		var tbody = $('#'+prefix+'-tbody');
		tbody.empty();
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		for (var i = 0; i < results.length; i++) {
			var re = results[i];
			var tr = $('<tr data-href="'+detailPage+'?id=' + re.id + '"></tr>');
			tr.append('<td >' + re.name + '</td>');
			tr.append('<td >' + re.code + '</td>');
			tr.append('<td >' + re.addr + '</td>');
			tr.append('<td >' + re.tel + '</td>');			
			tr.appendTo(tbody);
		}

		var initTrClick = function() {			
			$('#'+prefix+'-tbody > tr').css('cursor', 'pointer').off('click');
			$('#'+prefix+'-tbody > tr').css('cursor', 'pointer').on('click', function() {
				openPage($(this).attr('data-href'), false, false);
			});
		}
		initTrClick();
		
		initSortTable('#'+prefix+'-list-table', initTrClick);
		initFixedTable('#l'+prefix+'-list-table');			
	});


	$('body').on('list-item', function(e, obj){		
		if (obj.couldBack) return;

		var sql = 'SELECT item.*, kind.text from item left join kind on kind.id = item.kind_id;'
		var prefix = 'lit';	
		var detailPage = 'item';
		
		var results = alasql(sql);		
		var tbody = $('#'+prefix+'-tbody');
		tbody.empty();
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		for (var i = 0; i < results.length; i++) {
			var re = results[i];
			var tr = $('<tr data-href="'+detailPage+'?id=' + re.id + '"></tr>');
			tr.append('<td >' + re.code + '</td>');
			tr.append('<td >' + re.text + '</td>');
			tr.append('<td >' + re.maker + '</td>');
			tr.append('<td >' + re.detail + '</td>');	
			tr.append('<td >' + re.unit + '</td>');
			tr.appendTo(tbody);
		}

		var initTrClick = function() {			
			$('#'+prefix+'-tbody > tr').css('cursor', 'pointer').off('click');
			$('#'+prefix+'-tbody > tr').css('cursor', 'pointer').on('click', function() {
				openPage($(this).attr('data-href'), false, false);
			});
		}
		initTrClick();
		
		initSortTable('#'+prefix+'-list-table', initTrClick);
		initFixedTable('#l'+prefix+'-list-table');			
	});


	$('body').on('list-contact', function(e, obj){		
		if (obj.couldBack) return;	
		var prefix = 'lep';	
		var detailPage = 'contact';

		var sql = 'SELECT * from emp;'
		var results = alasql(sql);		
		var tbody = $('#'+prefix+'-tbody');
		tbody.empty();
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		for (var i = 0; i < results.length; i++) {
			var re = results[i];
			var tr = $('<tr data-href="'+detailPage+'?type=emp&id=' + re.id + '"></tr>');
			tr.append('<td >' + re.name + '</td>');
			tr.append('<td >Our Company</td>');
			tr.append('<td >' + re.emp_num + '</td>');
			tr.append('<td >' + empTitle(re.title) + '</td>');	
			tr.append('<td >' + re.tel + '</td>');
			tr.append('<td >' + re.email + '</td>');
			tr.append('<td >' + (getEmpWhouseStr(re.id) == '' ? '-':getEmpWhouseStr(re.id)) + '</td>');			
			tr.appendTo(tbody);
		}
		sql = 'SELECT * from partner;'
		results = alasql(sql);		
		tbody.parent('table').css('width', '').find('thead>tr>th').css('width', '');
		for (var i = 0; i < results.length; i++) {
			var re = results[i];
			var tr = $('<tr data-href="'+detailPage+'?type=partner&id=' + re.id + '"></tr>');
			tr.append('<td >' + re.name + '</td>');
			tr.append('<td >' + re.company + '</td>');
			tr.append('<td >' + re.emp_num + '</td>');
			tr.append('<td >' + re.title + '</td>');	
			tr.append('<td >' + re.tel + '</td>');
			tr.append('<td >' + re.email + '</td>');
			tr.append('<td >-</td>');
			tr.appendTo(tbody);
		}

		var initTrClick = function() {			
			$('#'+prefix+'-tbody > tr').css('cursor', 'pointer').off('click');
			$('#'+prefix+'-tbody > tr').css('cursor', 'pointer').on('click', function() {
				openPage($(this).attr('data-href'), false, false);
			});
		}
		initTrClick();
		
		initSortTable('#'+prefix+'-list-table', initTrClick);
		initFixedTable('#l'+prefix+'-list-table');			
	});

	$('body').on('item', function(e, obj){
		if (obj.couldBack) return;
		var id = parseInt(obj.id);
		var item = alasql('select item.*, kind.text from item left join kind on kind.id=item.kind_id where item.id=?;', [id])[0];

		$('#it-title-back').off('click').on('click', function(){historyBack();});
		$('#it-title-productname span').text(item.detail);
		$('#it-add-itembatch').show();
		if (DB.getUserEmp().title >= 5) {
			$('#it-add-itembatch').hide();
		}
		//item detail	
		$('#it-img').prop('src', 'img/'+id+'.jpg')
		$('#it-code').text(item.code);
		$('#it-detail').text(item.detail);
		$('#it-maker').text(item.maker);
		$('#it-kind').text(item.text);
		$('#it-unit').text(item.unit);
		$('#it-description').text(cutStr(item.comment, 30));
		

		var reloadBatchTable = function() {
			var batches = alasql('select * from itembatch where item_id = ?', [id]);
			$('#it-batch-tbody').empty().append(batches.map(function(b){
				return $('<tr pid="'+b.id+'"><td>'+b.lot+'</td><td>'+(b.expiration_date?b.expiration_date:'-')+'</td><td name="it-batch-deadline"><span name="it-batch-deadline-span">'+(b.deadline_date?b.deadline_date:'-')+' </span><span class="glyphicon glyphicon-pencil edit-span"></span></td><td>'+
					(b.cost==0?'-':secret(numberWithCommas(b.cost)))+'</td><td>'+(b.cost_unit?b.cost_unit:'-')+'</td><td>'+cutStr(b.description)+'</td></tr>');
			}));	
			if (DB.getUserEmp().title >= 5) {
				$('#it-batch-tbody tr td[name=it-batch-deadline] span[class*=edit-span]').remove();
			}		
			$('#it-batch-tbody tr td[name=it-batch-deadline] span[class*=edit-span]').off('click').on('click', function(){
				var batch_id = parseInt($(this).parents('tr:first').attr('pid'));
				var batch = alasql('select * from itembatch where id=?;', [batch_id])[0];
				if ($(this).hasClass('glyphicon-pencil')) {
					$(this).removeClass('glyphicon-pencil').addClass('glyphicon-ok');
					$(this).prev('span').empty().append('<input type="date" style="display:inline;max-width:140px;"> ');
					$(this).prev('span').find('input').val(batch.deadline_date);
				} else {
					$(this).addClass('glyphicon-pencil').removeClass('glyphicon-ok');
					var newDeadline = $(this).prev('span').find('input').val();
					alasql('update itembatch set deadline_date = ? where id = ?;', [newDeadline, batch.id]);
					alasql('select * from stock').forEach(function(s) {
						DB.insertExpireMessage(s.id);			
					});
					$(this).prev('span').empty().append(newDeadline?newDeadline+' ':'- ');
				}
			});
		}
		reloadBatchTable();

		$('#it-add-itembatch').off('click').on('click', function(e) {
			e.stopPropagation();
			$(this).off('additembatch').on('additembatch', function(e, newItem){
				reloadBatchTable();
			});
			setHistoryBackObj($(this), 'additembatch');
			openPage('add?type=itembatch&item_id='+item.id, false, false);
		});

		$('#it-stock-tbody').empty();
		var batches = alasql('select * from itembatch where item_id = ?', [id]);
		batches.forEach(function(b) {
			var stocks = alasql('select * from stock where itembatch_id=?;', [b.id]);
			if (DB.getUserEmp().title > 4) {
				stocks = stocks.filter(function(s){return DB.keeperPriorityWhouse(s.whouse_id);});
			}
			$('#it-stock-tbody').append(stocks.map(function(s){
				var whouse = alasql('select * from whouse where id=?', [s.whouse_id])[0];
				return $('<tr pid="'+s.id+'"><td>'+b.lot+'</td><td>'+whouse.name+'</td><td>'+b.expiration_date+'</td><td>'+numberWithCommas(s.balance)+'</td></tr>');
			}));
		});
		function initTrClick() {			
			$('#it-stock-tbody > tr').css('cursor', 'pointer').off('click').on('click', function() {
				openPage('stock?id='+$(this).attr('pid'), false, false);
			});
		}
		initTrClick();

		initSortTable('#it-stock-table', initTrClick);	
		tooltip();		
	});




	$('body').on('whouse', function(e, obj){
		if (obj.couldBack) return;
		var id = parseInt(obj.id);
		var whouse = alasql('select * from whouse where id=?;', [id])[0];		

		$('#wh-title-back').off('click').on('click', function(){historyBack();});
		$('#wh-stock-table-div').hide();
		$('#wh-blueblock-name').text(whouse.name);
		$('#wh-name').text(whouse.name);
		$('#wh-code').text(whouse.code);
		$('#wh-addr').text(whouse.addr);
		$('#wh-tel').text(whouse.tel);

		//staff
		var staff = alasql('select * from emp').filter(function(e){
			return e.title == 2 || alasql('select * from emp_whouse where emp_id=? and whouse_id=?', [e.id, id]).length > 0;
		});
		$('#wh-blueblock-emp-table tbody').empty().append(staff.map(function(e){
			return $('<tr pid="'+e.id+'"><td>'+e.name+'</td><td>'+empTitle(e.title)+'</td><td>'+e.emp_num+'</td></tr>');
		}));

		//stock
		if (DB.getUserEmp().title <= 4 || DB.keeperPriorityWhouse(id)) {
			$('#wh-stock-table-div').show();
			var stocks = alasql('select stock.id, stock.balance, itembatch.lot, item.detail, item.code, item.maker, itembatch.cost, itembatch.cost_unit, item.unit from stock\
								left join itembatch on stock.itembatch_id=itembatch.id left join item on item.id=itembatch.item_id\
								where stock.whouse_id = ? and stock.balance > 0;', [id]);
			$('#wh-stock-table tbody').empty().append(stocks.map(function(o) {
				return $('<tr pid="'+o.id+'"><td>'+o.code+'</td><td>'+o.detail+'</td><td>'+o.maker+
					'</td><td>'+o.lot+'</td><td style="text-align:right" sv="'+o.cost+'">'+secret(numberWithCommas(o.cost))+
					'</td><td style="text-align:right">'+o.balance+'</td><td>'+o.unit+'</td></tr>');
			}));			
		}
		function initTrClick() {			
			$('#wh-stock-table').find('tbody > tr').css('cursor', 'pointer').off('click').on('click', function() {			
				openPage('stock?id='+$(this).attr('pid'), false, false);			
			});
			$('#wh-blueblock-emp-table').find('tbody > tr').css('cursor', 'pointer').off('click').on('click', function() {			
				openPage('contact?type=emp&id='+$(this).attr('pid'), false, false);			
			});
		}
		initTrClick();
		initSortTable('#wh-stock-table', initTrClick);		
	});




	$('body').on('contact', function(e, obj){
		if (obj.couldBack) return;
		var id = parseInt(obj.id);
		var type = obj.type;
		var contact = alasql('select * from '+type+' where id=?;', [id])[0];
		contact.pre_title = contact.title;
		contact.title = type == 'emp'? empTitle(contact.title, false, true):contact.title;
		contact.company = type=='emp' ? 'Our Company':contact.company;
		contact.emp_whouses = type=='emp' ? getEmpWhouseStr(contact.id): '-';
		contact.emp_whouses = contact.emp_whouses? contact.emp_whouses:'-';

		$('#ep-title-back').off('click').on('click', function(){historyBack();});
		$('#ep-cooperation-table-div, #ep-task-table-div, #ep-operation-table-div').hide();
		$('#ep-card-name').text(contact.name);
		$('#ep-card-title').text(contact.title);
		$('#ep-card-company').text(contact.company);
		$('#ep-card-tel').text(contact.tel);

		//detail	
		$('#ep-company').text(contact.company);
		$('#ep-name').text(contact.name);
		$('#ep-emp-num').text(contact.emp_num);
		$('#ep-title').text(contact.title);
		$('#ep-emp-whouses').text(contact.emp_whouses);
		$('#ep-gender').text(gender(contact.gender));
		$('#ep-tel').text(contact.tel);
		$('#ep-email').text(contact.email);

		//business operation - partner
		if (DB.getUserEmp().title <= 4 && type == 'partner') {
			$('#ep-cooperation-table-div').show();
			var inorders = alasql('select * from inorder where supplier_cid = ? and supplier_type = ? order by id desc;', [id, 2]);
			inorders = inorders.map(function(o){
				var tem = {};
				tem.role='Supplier';
				tem.order_type=1;
				tem.order_id=o.id;
				tem.apply_time=o.apply_time;
				tem.update_time=o.update_time;
				tem.status=o.status;
				return tem;
			});
			var outorders = alasql('select * from outorder where buyer_cid = ? and buyer_type = ? order by id desc;', [id, 2]);
			outorders = outorders.map(function(o){
				var tem = {};
				tem.role='Buyer/Receiver';
				tem.order_type=2;
				tem.order_id=o.id;
				tem.apply_time=o.apply_time;
				tem.update_time=o.update_time;
				tem.status=o.status;
				return tem;
			});
			var orders = inorders.concat(outorders).sort(function(a, b){return a.update_time>b.update_time?1:(a.update_time<b.update_time?-1:0)})
			$('#ep-cooperation-table tbody').empty().append(orders.map(function(o){
				return $('<tr><td>'+o.role+'</td><td name="ep-order-href" ptype="'+o.order_type+'" pid="'+o.order_id+'"><a style="cursor:pointer">'+
						getOrderDisStr(o.order_type, o.order_id)+'</a></td><td>'+orderStatusLabel(o.order_type, o.status)+'</td><td>'+
						o.apply_time+'</td><td>'+o.update_time+'</td></tr>');
			}));
		}

		//task - emp
		if ((DB.getUserEmp().title <= 4 || DB.getUserEmp().id == id) && type == 'emp' && contact.pre_title > 4) {
			$('#ep-task-table-div').show();
			var tasks = alasql('select * from task where worker_cid=? order by id desc;', [id]);
			$('#ep-task-table tbody').empty().append(tasks.map(function(o){				
				return $('<tr><td>'+FirstCharUpper(o.task_name)+'</td><td name="ep-order-href" ptype="'+o.order_type+'" pid="'+o.order_id+'"><a style="cursor:pointer">'+
						getOrderDisStr(o.order_type, o.order_id)+'</a></td><td>'+o.apply_time+'</td><td>'+
						o.finish_time+'</td><td>'+o.status+'</td></tr>');
			}));			
		}

		//operation - emp
		if ((DB.getUserEmp().title <= 4 || DB.getUserEmp().id == id) && type == 'emp' && contact.pre_title <= 4) {
			$('#ep-operation-table-div').show();
			var tasks = alasql('select * from orderstatushistory where who_cid=? order by id desc;', [id]);
			$('#ep-operation-table tbody').empty().append(tasks.map(function(o){				
				return $('<tr><td>'+o.time+'</td><td name="ep-order-href" ptype="'+o.order_type+'" pid="'+o.order_id+'"><a style="cursor:pointer">'+
						getOrderDisStr(o.order_type, o.order_id)+'</a></td><td>'+getOperationStr(o.order_type, o.order_id, o.from_status, o.to_status)+'</td></tr>');
			}));
		}

		function initTrClick() {			
			$('#ep-cooperation-table,#ep-task-table,#ep-operation-table').find('tbody > tr > td[name=ep-order-href] > a').off('click').on('click', function() {
				var td = $(this).parents('td:first');
				var order_type = parseInt(td.attr('ptype'));
				var order_id = parseInt(td.attr('pid'));
				if (order_type == 1) {
					openPage('check-in-order?id='+order_id, false, false);
				} else if (order_type == 2) {
					openPage('check-out-order?id='+order_id, false, false);
				} else if (order_type == 3) {
					openPage('transfer-order?id='+order_id, false, false);
				}
				
			});
		}
		initTrClick();
		initSortTable('#ep-cooperation-table,#ep-task-table,#ep-operation-table', initTrClick);		
	});



	$('body').on('add', function(e, obj){		
		if (obj.couldBack) return;

		$('input[id*=add-whouse-]').val('');
		$('input[id*=add-item-]').val('');
		$('#add-item-unit').val('Pcs');
		$('input[id*=add-itembatch-]').val('');
		$('#add-contact-type').val('emp');
		$('#add-contact-gender,#add-contact-emp-title').val('1');
		$('input[id*=add-contact-]').val('');
		$('textarea').val('');
		
		$('#add-whouse-div, #add-item-div, #add-itembatch-div, #add-contact-div').hide();
		$('#add-submit-warning').parents('label:first').hide();
		$('#add-'+obj.type+'-div').show();
		$('#add-submit-warning').parents('label:first').hide();
		if (obj.type == 'whouse') {
			$('#add-title').text('Warehouse');
			$('#add-save').off('click').on('click', function() {
				$('#add-submit-warning').parents('label:first').hide();
				var warnings = [];
				if ($('#add-whouse-name').val().trim() == '' || $('#add-whouse-code').val().trim() == '' || $('#add-whouse-addr').val().trim() == '') {
					warnings.push('Warehouse name, code and address are necessary.');
				}
				if (alasql('select * from whouse where name = ?;', [$('#add-whouse-name').val().trim()]).length > 0 || alasql('select * from whouse where code = ?;', [$('#add-whouse-code').val().trim()]).length > 0) {
					warnings.push('The name or code of warehouse has existed.');
				}
				if(warnings.length > 0) {
					warnings.unshift('Submit Fail:');
					$('#add-submit-warning').empty().append(warnings.join('<br>'));
					$('#add-submit-warning').parents('label:first').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#add-submit-warning')[0].offsetTop);
					return;
				}
				
				var newWhouse = DB.addWhouse($('#add-whouse-name').val().trim(), $('#add-whouse-code').val().trim(),$('#add-whouse-addr').val().trim(),$('#add-whouse-tel').val().trim());				
				addInfoMess('Add new warehouse:', '<p>Create success.</p>', null, 90);	
				runAndResetHistoryBackObj(newWhouse);			
				historyBack(obj.refresh=='true'?true:false);
			});
		} else if (obj.type == 'item') {
			$('#add-title').text('Product Information');
			$('#add-item-new-kind, #add-item-new-kind-save').hide();
			$('#add-item-new-kind').val('');
			$('#add-item-new-kind-span').off('click').on('click', function(){
				$('#add-item-new-kind, #add-item-new-kind-save').show();
				$('#add-item-new-kind').val('');
				$('#add-item-new-kind-span, #add-item-kind').hide();
			});
			$('#add-item-new-kind-save').off('click').on('click', function(){
				$('#add-item-new-kind, #add-item-new-kind-save').hide();
				$('#add-item-new-kind-span, #add-item-kind').show();
				if($('#add-item-new-kind').val().trim()) {
					var newKind = DB.addKind($('#add-item-new-kind').val().trim());							
				}				
				$('#add-item-kind').empty().append(alasql('select * from kind;').map(function(k){return '<option value="'+k.id+'">'+k.text+'</option>';}));
				if (newKind) {
					$('#add-item-kind').val(newKind.id);
				}	
			}).trigger('click');
			tooltip();

			$('#add-save').off('click').on('click', function() {				
				$('#add-submit-warning').parents('label:first').hide();
				var warnings = [];
				if (alasql('select * from item where code = ?;',[$('#add-item-code').val()]).length > 0) {
					warnings.push('This product code has existed.');
				}
				if (alasql('select * from item where detail = ?;',[$('#add-item-detail').val()]).length > 0) {
					warnings.push('This product name has existed.');
				}
				if ($('#add-item-code').val().trim() == '' || $('#add-item-detail').val().trim() == '' || !$('#add-item-kind').val()) {
					warnings.push('The display name, code and classification of this product are necessary.');
				}
				if ($('#add-item-new-kind-save').is(':visible')) {
					warnings.push('Please save the classification.');
				}
				if(warnings.length > 0) {
					warnings.unshift('Submit Fail:');
					$('#add-submit-warning').empty().append(warnings.join('<br>'));
					$('#add-submit-warning').parents('label:first').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#add-submit-warning')[0].offsetTop);
					return;
				}
				var newItem = DB.addItem($('#add-item-detail').val().trim(), $('#add-item-code').val().trim(), parseInt($('#add-item-kind').val()), $('#add-item-maker').val().trim(), $('#add-item-unit').val(), $('#add-item-comment').val());
				addInfoMess('Add new product:', '<p>Create success.</p>', null, 90);
				runAndResetHistoryBackObj(newItem);				
				historyBack(obj.refresh=='true'?true:false);
			});
		} else if (obj.type == 'itembatch') {
			var item_id = obj.item_id;
			var item = alasql('select * from item where id = ?;', [parseInt(item_id)])[0];
			$('#add-title').text('Batch Information for "'+item.detail+'"');
			
			$('#add-save').off('click').on('click', function() {
				$('#add-submit-warning').parents('label:first').hide();
				var warnings = [];
				if ($('#add-itembatch-lot').val().trim() == '') {
					warnings.push('Batch Code is necessary.');
				}
				if (parseFloat($('#add-itembatch-cost').val()) < 0) {
					warnings.push('The cost should not be negative.');
				}
				if (alasql('select * from itembatch where item_id = ? and lot = ?', [item_id, $('#add-itembatch-lot').val().trim()]).length > 0) {
					warnings.push('The batch code has existed.');
				}
				if(warnings.length > 0) {
					warnings.unshift('Submit Fail:');
					$('#add-submit-warning').empty().append(warnings.join('<br>'));
					$('#add-submit-warning').parents('label:first').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#add-submit-warning')[0].offsetTop);
					return;
				}
				var newItembatch = DB.addItembatch(item_id, $('#add-itembatch-lot').val().trim(), $('#add-itembatch-expire').val().trim(), $('#add-itembatch-deadline').val().trim(),
				 	parseFloat($('#add-itembatch-cost').val()), $('#add-itembatch-cost-unit').val().trim(), $('#add-itembatch-description').val());
				addInfoMess('Add new batch:', '<p>Create success.</p>', null, 90);	
				runAndResetHistoryBackObj(newItembatch);			
				historyBack(obj.refresh=='true'?true:false);
			});
		} else if (obj.type == 'contact') {
			$('#add-title').text('Contact');
			$('#add-contact-emp-whouse').empty().append(alasql('select * from whouse;').map(function(w){
				return '<option value="'+w.id+'">'+w.name+'</option>';
			}));			

			$('#add-contact-type').off('change').on('change', function(){
				if ($(this).val() == 'partner') {
					$('#add-contact-partner-title').show();
					$('#add-contact-emp-title').hide();
					$('#add-contact-company').val('').prop('disabled', false);
					$('#add-contact-emp-whouse').parents('div:first').hide();
				} else {
					$(this).val('emp');
					$('#add-contact-partner-title').hide();
					$('#add-contact-emp-title').show();
					$('#add-contact-company').val('Our Company').prop('disabled', true);
					if ($(this).val() == 4 || $(this).val() == 5) {
						$('#add-contact-emp-whouse').parents('div:first').show();
					} else {
						$('#add-contact-emp-whouse').parents('div:first').hide();
					}
				}
			}).trigger('change');

			$('#add-contact-emp-title').off('change').on('change', function(){				
				if ($(this).val() == 4 || $(this).val() == 5) {
					$('#add-contact-emp-whouse').parents('div:first').show();
				} else {
					$('#add-contact-emp-whouse').parents('div:first').hide();
				}
			}).trigger('change');

			$('#add-save').off('click').on('click', function() {				
				$('#add-submit-warning').parents('label:first').hide();
				var warnings = [];
				if ($('#add-contact-type').val() != 'emp' && $('#add-contact-type').val() != 'partner') {
					warnings.push('Please select a correct type.');
				}
				if ($('#add-contact-gender').val() != '1' && $('#add-contact-gender').val() != '2') {
					warnings.push('Please select a correct gender.');
				}
				if ($('#add-contact-company').val().trim() == '' || $('#add-contact-name').val().trim() == '' || $('#add-contact-emp-num').val().trim() == '') {
					warnings.push('Please correct the name, employee number or the company.');
				}
				if ($('#add-contact-type').val() == 'emp') {
					if (!parseInt($('#add-contact-emp-title').val())) {
						warnings.push('Please correct the title.');
					}
					if (alasql('select * from emp where emp_num = ?;', [$('#add-contact-emp-num').val().trim()]).length > 0) {
						warnings.push('This Employee number has existed.');
					}
				} else if ($('#add-contact-type').val() == 'partner') {
					if ($('#add-contact-partner-title').val().trim() == '') {
						warnings.push('Please input the job title of partner.');
					}
					if (alasql('select * from partner where emp_num = ? and company = ?;', [$('#add-contact-emp-num').val().trim(), $('#add-contact-company').val().trim()]).length > 0) {
						warnings.push('This Employee number has existed in this company.');
					}
				}
				if(warnings.length > 0) {
					warnings.unshift('Submit Fail:');
					$('#add-submit-warning').empty().append(warnings.join('<br>'));
					$('#add-submit-warning').parents('label:first').show();
					$('[name=mainbody]').filter(':visible').scrollTop($('#add-submit-warning')[0].offsetTop);
					return;
				}
				if ($('#add-contact-type').val() == 'emp') {
					var newContact = DB.addEmp($('#add-contact-name').val().trim(), $('#add-contact-emp-num').val().trim(), parseInt($('#add-contact-gender').val()),
							parseInt($('#add-contact-emp-title').val()), $('#add-contact-tel').val().trim(), $('#add-contact-email').val().trim(), $('#add-contact-emp-whouse').val());					
				} else if ($('#add-contact-type').val() == 'partner') {
					var newContact = DB.addPartner($('#add-contact-company').val().trim(), $('#add-contact-name').val().trim(), $('#add-contact-emp-num').val().trim(), parseInt($('#add-contact-gender').val()),
							$('#add-contact-partner-title').val(), $('#add-contact-tel').val().trim(), $('#add-contact-email').val().trim());
				}				
				addInfoMess('Add new contact:', '<p>Create success.</p>', null, 90);	
				runAndResetHistoryBackObj(newContact);			
				historyBack(obj.refresh=='true'?true:false);
			});
		}
	});


	$('body').on('login', function(e, obj){	
		$('div[name=mainbody]:visible').scrollTop(0);
		$('#nav-home,#nav-user,#openFuncBar,#functionbar').addClass('tem-hide');
		$('#login-username, #login-password').val('');

		$('#login-form').off('submit').on('submit', function(e){return false;});
		$('#login-submit').off('click').on('click', function(e){
			e.stopPropagation();
			var user = alasql('select * from user where username=? and password=?;', [$('#login-username').val(), $('#login-password').val()])[0];
			if (!user) {
				addInfoMess('Login Fail:', '<p>Wrong username or password.', null, 90);
				$('#login-username, #login-password').val('');
			} else {
				document.cookie = 'uid='+user.id;
				setting = DB.getSetting();
				$('#index-username').text(DB.getUserEmp().name);
				$('#nav-home,#nav-user,#openFuncBar,#functionbar').removeClass('tem-hide');
				openPage('home', true, false);
				toggleFunctionBar(true, true);
			}
		});		
	});

	$('body').on('prediction', function(e, obj){		
		var itembatch_id = parseInt(obj.itembatch_id);
		var whouse_id = parseInt(obj.whouse_id);
		var itembatch = alasql('select itembatch.lot, item.detail from itembatch left join item on itembatch.item_id=item.id where itembatch.id=?;',
					[itembatch_id])[0];
		var whouse = alasql('select * from whouse where id=?;', [whouse_id])[0];		
		$('#pre-title-name').text(itembatch.detail+'(Batch:'+itembatch.lot+'), '+whouse.name);
		$('#pre-title-back').off('click').on('click', function(){historyBack();});

		var date = obj.date;
		var order_type = parseInt(obj.order_type);
		var change = parseInt(obj.change);
		constructPrediction(itembatch_id, whouse_id, obj.add, date, order_type, obj.is_transfer_in, change);		
	});

	$('body').on('list-prediction', function(e, obj) {		
		$('#lpre-table tbody').empty();
		var outorderitembatchs = 		alasql('select orderitembatch.itembatch_id, whouse.name as whouse_name, whouse.id as whouse_id, item.detail as item_name, itembatch.lot\
										from orderitembatch left join outorder on outorder.id=orderitembatch.order_id\
										left join itembatch on orderitembatch.itembatch_id=itembatch.id left join item on item.id=itembatch.item_id\
										left join whouse on whouse.id=outorder.whouse_id where orderitembatch.order_type=?;', [2]);
		var transferorderitembatchs = 	alasql('select orderitembatch.itembatch_id, whouse.name as whouse_name, whouse.id as whouse_id, item.detail as item_name, itembatch.lot\
										from orderitembatch left join transferorder on transferorder.id=orderitembatch.order_id\
										left join itembatch on orderitembatch.itembatch_id=itembatch.id left join item on item.id=itembatch.item_id\
										left join whouse on whouse.id=transferorder.whouse_out_id where orderitembatch.order_type=?;', [3]);
		var checkDuplicate = [];
		var oibs = outorderitembatchs.concat(transferorderitembatchs).filter(function(o){
			if ($.inArray(o.itembatch_id+'-'+o.whouse_id, checkDuplicate) >= 0) {
				return false;
			} else {
				checkDuplicate.push(o.itembatch_id+'-'+o.whouse_id);
				if (constructPrediction(o.itembatch_id, o.whouse_id).isDanger) {
					return true;
				} else {
					return false;
				}
			}
		});

		if(DB.getUserEmp().title == 5) {
			addInfoMess('Access Fail:', '<p>You do not have priority to view these information.</p>', null, 90);
			return;
		} else if (DB.getUserEmp().title == 4) {
			oibs = oibs.filter(function(o){return DB.keeperPriorityWhouse(o.whouse_id);});
		}

		if (oibs.length == 0) {
			addInfoMess('No risk found:', '<p>Everything is all right.</p>', null, 90);
		}

		$('#lpre-table tbody').empty().append(oibs.map(function(o){
			var tr = $('<tr><td>'+o.item_name+' ('+o.lot+')</td><td>'+o.whouse_name+'</td><td>'+'Need at least '+constructPrediction(o.itembatch_id, o.whouse_id).supplyAmount+' More.</td></tr>');
			tr.css('cursor', 'pointer').on('click', function(){openPage('prediction?itembatch_id='+o.itembatch_id+'&whouse_id='+o.whouse_id, false, false)});
			return tr;
		}));		
	});

	function constructPrediction(itembatch_id, whouse_id, add, date, order_type, is_transfer_in, change) {		
		is_transfer_in = (is_transfer_in==='true'||is_transfer_in===true)? true:false;
		add = (add==='true'||add===true)? true:false;		
		var isDanger = false;
		var minAmount = Number.MAX_VALUE;
		var stock = alasql('select * from stock where itembatch_id=? and whouse_id=?;', [itembatch_id, whouse_id])[0];
		var today = parseDate(new Date()).substring(0, 10);		
		if (!stock) {
			stock = {itembatch_id:itembatch_id, whouse_id:whouse_id, balance:0};				
		}		

		var inorders = alasql('select orderitembatch.*, inorder.status, transport.arrival_date as date from orderitembatch left join inorder on orderitembatch.order_type = ? and orderitembatch.order_id = inorder.id\
								left join transport on transport.order_type=? and transport.order_id=inorder.id\
								where orderitembatch.itembatch_id=? and inorder.whouse_id=? and inorder.status<? and inorder.status not in (?,?,?);', [1, 1, itembatch_id, whouse_id, 9, 2, 3, 7]);
		var outorders = alasql('select orderitembatch.*, outorder.status, transport.delivery_date as date from orderitembatch left join outorder on orderitembatch.order_type = ? and orderitembatch.order_id = outorder.id\
								left join transport on transport.order_type=? and transport.order_id=outorder.id\
								where orderitembatch.itembatch_id=? and outorder.whouse_id=? and outorder.status<? and outorder.status not in (?,?);', [2, 2, itembatch_id, whouse_id, 6, 2, 3]);
		var transferinorders = alasql('select orderitembatch.*, transferorder.status, transport.arrival_date as date from orderitembatch left join transferorder on orderitembatch.order_type = ? and orderitembatch.order_id = transferorder.id\
								left join transport on transport.order_type=? and transport.order_id=transferorder.id\
								where orderitembatch.itembatch_id=? and transferorder.whouse_in_id=? and transferorder.status<? and transferorder.status not in (?,?);', [3, 3, itembatch_id, whouse_id, 9, 2, 3]);
		var transferoutorders = alasql('select orderitembatch.*, transferorder.status, transport.delivery_date as date from orderitembatch left join transferorder on orderitembatch.order_type = ? and orderitembatch.order_id = transferorder.id\
								left join transport on transport.order_type=? and transport.order_id=transferorder.id\
								where orderitembatch.itembatch_id=? and transferorder.whouse_out_id=? and transferorder.status<? and transferorder.status not in (?,?);', [3, 3, itembatch_id, whouse_id, 6, 2, 3]);
		var addorders = [];
		if (add) {
			addorders.push({add:true, date:date, order_type:order_type, whouse_id:whouse_id, balance:change,
						tem_order_type:(order_type==3?(is_transfer_in?3:4):order_type), 
						priority:(order_type==1?1:(order_type==2?3:(is_transfer_in?2:4)))});			
		}		
		inorders.map(function(o){o.order_type=1;o.priority=1;o.tem_order_type=1;return o;});
		outorders.map(function(o){o.order_type=2;o.priority=3;o.tem_order_type=2;return o;});
		transferinorders.map(function(o){o.order_type=3;o.priority=2;o.tem_order_type=3;return o;});
		transferoutorders.map(function(o){o.order_type=3;o.priority=4;o.tem_order_type=4;return o;});
		var orders = inorders.concat(outorders).concat(transferinorders).concat(transferoutorders).concat(addorders).sort(function(a,b){	
			if ((a.date && a.date < today) || (b.date && b.date < today)){
				if ((a.date && a.date < today) && (b.date && b.date < today)) {
					return a.date>b.date?1:(a.date==b.date?(a.priority-b.priority):-1);
				} else if (a.date && a.date < today) {
					return 1;
				} else {
					return -1;
				}
			} 
			if (!a.date || !b.date){return (!a.date&&!b.date)?(a.priority-b.priority):(!a.date?1:-1);}
			return a.date>b.date?1:(a.date==b.date?(a.priority-b.priority):-1);
		});
		
		var tem_last_date = null;
		var tem_amount = undefined;
		var addToday = false;
		$('#pre-table tbody').empty().append(orders.map(function(o) {			
			var t_today_str = '';
			if (!addToday) {
				var t_today_str = '<tr><th>'+today+' (Today)</th><td>-</td><td>-</td><td><span name="pre-table-td-amount">'+stock.balance+'</span></td></tr>';
				tem_last_date = today;
				tem_amount = tem_amount === undefined ? stock.balance : tem_amount;
				addToday = true;
			}
			var t_date = !o.date ? 'Unknown Date <span style="color:#ff7575;">(Transportation Information Missing!)</span>' : (
							tem_last_date == o.date ? '' : (
								o.date < today ? '<span style="text-decoration:line-through;">'+o.date + '</span> <span style="color:#ff7575;">(Transportation Not on Time!)</span>' : (
									o.date == today ? (today+' (Today)') : o.date)));
			if (!addToday && o.date == today) {
				addToday = true;
			}

			var t_balance = o.actual_balance?o.actual_balance:o.balance;
			t_balance = (o.tem_order_type == 2 || o.tem_order_type == 4) ? -t_balance:t_balance;
			if (tem_amount === undefined){
				if (o.date == today) {
					tem_amount = stock.blance;
				}
			} else {
				tem_amount += parseInt(t_balance);
			}
			
			var t_order_str = '<span name="pre-order-str" ptype="'+o.order_type+'" pid="'+(o.order_id?o.order_id:0)+'" style="cursor:pointer;">'+(o.order_id?(getOrderDisStr(o.order_type, o.order_id, whouse_id)+(o.status==1?' <span style="color:#ff7575;">(Applying)</span>':'')):'<span style="color:#e49111;font-weight:bold">This Order</span>')+'</span>';			
 			var t_balance_str = '<span style="'+(o.order_id?'':'color:#e49111;')+'">'+(t_balance>=0?'+'+t_balance:t_balance)+'</span>';
			var t_amount_str = '<span name="pre-table-td-amount" style="'+(tem_amount!==undefined&&tem_amount<0?'color:#ff7575;font-weight:bold;':'')+'">'+(tem_amount===undefined?'-':tem_amount)+'</span>'+(tem_amount!==undefined&&tem_amount<0?' <span class="glyphicon glyphicon-exclamation-sign" style="color:#ff7575;"></span>':'');
			tem_last_date = o.date;
			if (tem_amount!==undefined) {				
				minAmount = Math.min(minAmount, tem_amount);
				if(tem_amount<0) {
					isDanger = true;
				}
			}
						
			return $(t_today_str + '<tr tdate="'+(o.date?o.date:'')+'"><th>'+t_date+'</th><td>'+t_order_str+'</td><td>'+t_balance_str+'</td><td>'+t_amount_str+'</td></tr>');
		}));
		if (!addToday) {
			$('#pre-table tbody').append('<tr><th>'+today+' (Today)</th><td>-</td><td>-</td><td><span name="pre-table-td-amount">'+stock.balance+'</span></td></tr>');
			minAmount = Math.min(minAmount, stock.balance);
		}
		for (var i=1; i<$('#pre-table tbody tr').length; i++) {
			var preSpan = $('#pre-table tbody tr td span[name=pre-table-td-amount]').eq(i-1);
			var aftSpan = $('#pre-table tbody tr td span[name=pre-table-td-amount]').eq(i);			
			if (preSpan.parents('tr:first').attr('tdate') == aftSpan.parents('tr:first').attr('tdate') && preSpan.parents('tr:first').attr('tdate') && !isNaN(parseInt(preSpan.text()))) {
				preSpan.parents('td:first').find('*').css('display', 'none');				
			}	

			if(!$('#pre-table tbody tr').eq(i).find('th').text()) {
				$('#pre-table tbody tr').eq(i).find('th,td').css('border-top-style', 'none');
			}
		}
		$('#pre-table tbody').find('span[name=pre-order-str]').off('click').on('click', function(){
			var t_page = $(this).attr('ptype') == 3 ? 'transfer-order':($(this).attr('ptype') == 2 ? 'check-out-order':'check-in-order');
			if (!parseInt($(this).attr('pid'))==0) {
				openPage(t_page+'?id='+$(this).attr('pid'));
			}
		});	

		if (minAmount === Number.MAX_VALUE) {
			minAmount = 0;
		}					
		return {isDanger:isDanger, 
				availableAmount:Math.max(0, add?(order_type==2||(order_type==3&&!is_transfer_in)?minAmount+change:minAmount-change):minAmount), 
				supplyAmount:Math.max(0, -minAmount)};
	}


	$('body').on('list-alert', function(e, obj) {
		$('#lal-minimum-table tbody').empty();
		$('#lal-expire-table tbody').empty();	
		var stock = alasql('select stock.id as stock_id, stock.min_balance, stock.balance, itembatch.lot, itembatch.expiration_date, itembatch.deadline_date, stock.whouse_id, item.detail as item_name, whouse.name as whouse_name\
							from stock left join itembatch on stock.itembatch_id=itembatch.id\
							left join item on itembatch.item_id=item.id left join whouse on whouse.id=stock.whouse_id;');
		var minimumStock = stock.filter(function(s){return (!isNaN(parseInt(s.min_balance))&&s.min_balance&&s.balance<s.min_balance);});
		var expireStock = stock.filter(function(s){
			var today = parseDate(new Date());
			if(s.balance == 0) {
				return false;
			}
			return ((s.expiration_date&&s.expiration_date<today)||(s.deadline_date&&s.deadline_date<today));
		});

		if(DB.getUserEmp().title == 5) {
			addInfoMess('Access Fail:', '<p>You do not have priority to view these information.</p>', null, 90);
			return;
		} else if (DB.getUserEmp().title == 4) {
			minimumStock = minimumStock.filter(function(s){return DB.keeperPriorityWhouse(s.whouse_id);});
			expireStock = expireStock.filter(function(s){return DB.keeperPriorityWhouse(s.whouse_id);});
		}

		if (minimumStock.length == 0 && expireStock.length == 0) {
			addInfoMess('No alert found:', '<p>Everything is all right.</p>', null, 90);
		}

		$('#lal-minimum-table tbody').empty().append(minimumStock.map(function(o){
			var tr = $('<tr><td>'+o.item_name+' ('+o.lot+')</td><td>'+o.whouse_name+'</td><td>'+o.balance+'</td><td>'+o.min_balance+'</td></tr>');
			tr.css('cursor', 'pointer').on('click', function(){openPage('stock?id='+o.stock_id, false, false)});
			return tr;
		}));
		$('#lal-expire-table tbody').empty().append(expireStock.map(function(o){
			var tr = $('<tr><td>'+o.item_name+' ('+o.lot+')</td><td>'+o.whouse_name+'</td><td>'+o.balance+'</td><td>'+o.expiration_date+'</td><td>'+o.deadline_date+'</td></tr>');
			tr.css('cursor', 'pointer').on('click', function(){openPage('stock?id='+o.stock_id, false, false)});
			return tr;
		}));
	});



	$('body').on('home', function(e, obj) {
		// display tasks
		$('#home-task-ul').empty();
		var today = parseDate(new Date()).substring(0, 10);
		if (DB.getUserEmp().title == 4) {
			var inorder = alasql('select inorder.*, transport.order_type, transport.order_id from inorder left join transport on transport.order_id=inorder.id and transport.order_type=? where transport.arrival_date=?;', [1, today]).filter(function(o){
				return DB.keeperPriorityWhouse(o.whouse_id);
			});
			var outorder = alasql('select outorder.*, transport.order_type, transport.order_id from outorder left join transport on transport.order_id=outorder.id and transport.order_type=? where transport.delivery_date=?;', [2, today]).filter(function(o){
				return DB.keeperPriorityWhouse(o.whouse_id);
			});
			var transferinorder = alasql('select transferorder.*, transport.order_type, transport.order_id from transferorder left join transport on transport.order_id=transferorder.id and transport.order_type=? where transport.arrival_date=?;', [3, today]).filter(function(o){
				return DB.keeperPriorityWhouse(o.whouse_in_id);
			}).map(function(o){o.in=true; return o;});
			var transferoutorder = alasql('select transferorder.*, transport.order_type, transport.order_id from transferorder left join transport on transport.order_id=transferorder.id and transport.order_type=? where transport.delivery_date=?;', [3, today]).filter(function(o){
				return DB.keeperPriorityWhouse(o.whouse_out_id);
			}).map(function(o){o.in=false; return o;});

			$('#home-task-ul').append(inorder.concat(outorder).concat(transferinorder).concat(transferoutorder).sort(function(a,b){return a.update_time>b.update_time?-1:(a.update_time==b.update_time?0:1);}).map(function(o){
				var orderStr = getOrderDisStr(o.order_type, o.order_id, o.order_type==3?(o.in?o.whouse_in_id:o.whouse_out_id):undefined);
				if (o.order_type == 1) {
					orderStr = 'Cargo is expected to check-in today. ('+orderStr+')';
					if (o.status == 9) o.finish = true;
				} else if (o.order_type == 2) {
					orderStr = 'Cargo is expected to check-out today. ('+orderStr+')';
					if (o.status == 6) o.finish = true;
				} else if (o.in) {
					orderStr = 'Cargo is expected to transfer-in today. ('+orderStr+')';
					if (o.status == 9) o.finish = true;
				} else {
					orderStr = 'Cargo is expected to transfer-out today. ('+orderStr+')';
					if (o.status == 6) o.finish = true;
				}				
				var url = getPageName(o.order_type, o.order_id);
				var li = $('<li>'+orderStr+'</li>');
				if (o.finish) {
					li.css('text-decoration', 'line-through');
				}
				li.off('click').on('click', function() {
					openPage(url, null, null);
				});
				return li;
			}));
		} else if (DB.getUserEmp().title == 5) {
			$('#home-task-ul').append(alasql('select * from task where worker_cid=? order by id desc;', [DB.getCid()]).map(function(t){				
				var isFinishToday = t.finish_time && t.finish_time.substring(0, 10) == today;
				var transport = alasql('select * from transport where order_type=? and order_id=?', [t.order_type, t.order_id])[0];
				var date = t.order_type == 1 ? transport.arrival_date : (
							t.order_type == 2 ? transport.delivery_date : (
								t.task_name == 'picking' ? transport.delivery_date : transport.arrival_date));				
				if(!isFinishToday && (date != today)){return $('');}
				var li = $('<li>Task: '+FirstCharUpper(t.task_name)+' --- ('+getOrderDisStr(t.order_type, t.order_id)+')</li>');
				if (isFinishToday) {
					li.css('text-decoration', 'line-through');
				}
				li.off('click').on('click', function(){
					openPage(getPageName(t.order_type, t.order_id), null, null);
				});
				return li;
			}));
		}
		if ($('#home-task-ul li').length == 0) {
			$('#home-task-ul').empty().append($('<li> No tasks.</li>'));
		}

		// if is back
		if (obj.couldBack) return;
		alasql('select * from stock').forEach(function(s) {
			DB.insertExpireMessage(s.id);			
		});

		// display messages
		var messages = alasql('select * from message where cid=? order by id desc;', [DB.getCid()]);
		if (!setting.showReadMessage) {
			messages = messages.filter(function(m){return m.is_read==0||m.is_star==1;});
		}
		$('#home-message-ul').empty().append(messages.map(function(m){
			var li = $('<li><span class="glyphicon glyphicon-star-empty message-star"></span>'+m.message+'</li>');
			var checkLiStatus = function(){
				if (!m.is_star && m.is_read) {
					li.css('text-decoration', 'line-through');
				} else {
					li.css('text-decoration', 'none');
				}
				if(m.is_star) {
					li.find('span[class*=glyphicon]').removeClass('glyphicon-star-empty').addClass('onclick-star glyphicon-star');
				} else {
					li.find('span[class*=glyphicon]').addClass('glyphicon-star-empty').removeClass('onclick-star glyphicon-star');
				}
			}
			checkLiStatus();
			
			li.off('click').on('click', function(){
				openPage(m.url, null, null);
				m = DB.markMessageRead(m.id);
				checkLiStatus();
			});
			li.find('span[class*=glyphicon]').off('click').on('click', function(e){
				e.stopPropagation();
				if(m.is_star) {
					$(this).addClass('glyphicon-star-empty').removeClass('onclick-star glyphicon-star');
					m = DB.markMessageStar(m.id, false);
				} else {
					$(this).removeClass('glyphicon-star-empty').addClass('onclick-star glyphicon-star');
					m = DB.markMessageStar(m.id, true);
				}
				checkLiStatus();
			});
			return li;
		}));
		if ($('#home-message-ul li').length == 0) {
			$('#home-message-ul').empty().append($('<li> No messages.</li>'));
		}		
	});

	$('body').on('setting', function(e, obj) {
		$('#set-title-name').text(DB.getUserEmp().name);
		$('#set-title-title').text(empTitle(DB.getUserEmp().title));
		$('#set-title-whouse').text(getEmpWhouseStr(DB.getCid(), true)?getEmpWhouseStr(DB.getCid(), true):'---');

		$('#set-ul li span[id*=set-item-]').removeClass('glyphicon-check').addClass('glyphicon-unchecked').each(function(){
			var span = $(this);
			var id = span.attr('id').split('set-item-')[1];
			if (setting[id]) {
				span.removeClass('glyphicon-unchecked').addClass('glyphicon-check');
			}
			span.off('click').on('click', function(){
				if (span.hasClass('glyphicon-check')) {
					span.removeClass('glyphicon-check').addClass('glyphicon-unchecked');
					setting[id] = false;
				} else {
					span.removeClass('glyphicon-unchecked').addClass('glyphicon-check');
					setting[id] = true;
				}
				setting = DB.updateSetting(setting);
			});
		});
	});

	init();
	finalInit();
})
