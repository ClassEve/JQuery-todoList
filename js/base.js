/**
 * Created by Administrator on 2017/5/20.
 */

;(function () {
    'use strict';

    var $form_add_task = $('.add-task'),
        $body = $('body'),
        $window = $(window),
        $detail_task,
        $delete_task,
        task_list,
        $task_detail = $(".task-detail"),
        $task_detail_mask = $(".task-detail-mask"),
        current_index,
        $updata_form,
        $task_detail_content,
        $task_detail_content_input,
        $checkbox_complete,
        interval_timer
        ;

    init();

    $task_detail_mask.on('click',hide_task_detail);

    $form_add_task.on('submit',on_add_task_form);

    function pop(arg) {
        if(!arg){
            console.error('pop title is required')
        }

        var conf = {},timer,$box,$mask,$title,$content,$confirm,$cancel,dfd,confirmed;

        if(typeof arg == 'string'){
            conf.title = arg;
        }else{
            conf = $.extend(conf,arg);
        }

        dfd = $.Deferred();

        $box = $('<div>' +
            '<div class="pop-title">'+conf.title+'</div>' +
            '<div class="pop-content">'+(conf.content || '')+'</div>'+
                '<div class="pop-btn"><button class="primary confirm">确定</button><button class="cancel">取消</button></div>'+
            '</div>')
            .css({
                position:'fixed',
                width: 300,
                padding:'20px 0',
                background: '#fff',
                color: '#333',
                textAlign: 'center'
            });

        function dismiss_pop() {
            $mask.remove();
            $box.remove();
        }

        $confirm = $box.find('.confirm');

        $cancel  = $box.find('.cancel');

        $title = $box.find('.pop-title')
            .css({
                padding:'5px 10px',
                fontWeight: 900,
                fontSize: '20px'
            });

        $content = $box.find('.pop-content')
            .css({
                padding:'5px 10px'
            });

        $confirm.on('click',function () {
           confirmed = true;
        });

        $cancel.on('click',function () {
            confirmed = false;
        });



        $mask = $('<div></div>')
            .css({
                position:'fixed',
                top: 0,
                left:0,
                bottom: 0,
                right: 0,
                background:'rgba(0,0,0,.4)'
            });

        timer = setInterval(function () {
            if(confirmed != undefined){
                dfd.resolve(confirmed);
                clearInterval(timer);
                dismiss_pop();
            }
        },50);

        function adjust_box_position() {
            var window_width = $window.width(),
                window_height = $window.height(),
                box_width = $box.width(),
                box_height = $box.height(),
                move_x,
                move_y;

            move_x = (window_width - box_width) / 2;
            move_y = (window_height - box_height) / 3;

            $box.css({
                left: move_x,
                top: move_y
            });
        }
        $body.append($mask);
        $box.appendTo($body);
        adjust_box_position();
        $window.on('resize',adjust_box_position);

        return dfd.promise();


    }








    function  on_add_task_form(e) {
        var new_task = {};
        //禁用默认提交行为
        e.preventDefault();
        //获取新task的值
        var $input = $(this).find('input[name=content]');
        new_task.content =  $input.val();
        //如果新task的值为空，返回
        if(!new_task.content) return;

        //存入新task
        if(add_task(new_task)){
            render_task_list();
        }

        $input.val('');
    }

    function listion_task_detail() {
        var index;
        $('.task-item').on('dblclick',function () {
            index = $(this).data('index');
            show_task_detail(index);
        });

        $detail_task.on('click',function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            show_task_detail(index);
        })
    }


    function listion_checkbox_complete() {
        $checkbox_complete.on('click',function () {
            var $this = $(this);
            var isCom = $this.prop('checked');
            var index = $this.parent().parent().data('index');
            update_task(index,{complete: isCom});
        })
    }

    /*查看task详情*/
    function show_task_detail(index) {
        render_task_detail(index);
        current_index = index;
        $task_detail.show();
        $task_detail_mask.show();
    }

    function update_task(index,data) {
        if(!index || !task_list[index])
            return;
        //{complete: true}
        task_list[index] = $.extend({}, task_list[index], data );
        refresh_task_list();

    }

    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
    }

    /*渲染指定详细信息*/
    function render_task_detail(index) {
        if(index === undefined || !task_list[index])
            return;

        var item  = task_list[index];
        item.desc = item.desc || '无';
        var tpl = '<form>\
            <div class="content">'+item.content+'</div>\
            <div><input style="display: none" type="text" name="content" value="'+item.content+'"></div>\
            <div>\
            <div class="desc">\
            <textarea name="desc">'+item.desc+'</textarea>\
            </div>\
            </div>\
            <div class="remind">\
            <label class="remind_time_label">提醒时间</label>\
            <input class="datetime" name="remind_date" type="text" value="'+(item.remind_date || "")+'">\
            <button type="submit" class="btn_refresh">更新</button>\
            </div>\
            </form>';

        $task_detail.html('');
        $task_detail.html(tpl);
        $(".datetime").datetimepicker();
        $updata_form = $task_detail.find('form');
        $task_detail_content = $updata_form.find('.content');
        $task_detail_content_input = $updata_form.find('[name=content]');
        $task_detail_content.on('dblclick',function () {
            $task_detail_content_input.show();
            $task_detail_content.hide();
        });

        $updata_form.on('submit',function (e) {
            e.preventDefault();

            var data = {};
            data.content = $(this).find('[name = content]').val();
            data.desc = $(this).find('[name = desc]').val();
            data.remind_date = $(this).find('[name = remind_date]').val()
            update_task(index,data);
            hide_task_detail();

        });
    }

    function listion_task_delete() {
        if($delete_task.length != 0){
            $delete_task.on('click',function () {
                var $this = $(this);
                var $item = $this.parent().parent();
                var index = $item.data('index');
                pop('确定要删除吗')
                    .then(function (r) {
                        if(r)
                            delete_task(index);
                    });
            });
        }
    }


    function add_task(new_task) {
        task_list.push(new_task);
        //更新localstorage
        refresh_task_list();
        return true;
    }

    function refresh_task_list() {
        store.set('task_list',task_list);
        render_task_list();
    }


    function delete_task(index) {
        //如果没有index或者index不存在直接返回
        if(index === undefined || !task_list[index]) return;

        //如果存在
        task_list.splice(index,1);
        refresh_task_list();

    }



    function render_task_list() {
        var $task_list  =$(".task-list");
        $task_list.html('');
        task_list.forEach(function(val,index){
            var $render_task_item =  render_task_item(val,index);
            if(val.complete){
                $task_list.append($render_task_item);
            }else{
                $task_list.prepend($render_task_item);
            }
        });

       $delete_task = $(".action.delete");
       $detail_task = $(".action.detail");
       $checkbox_complete = $('.task-item .complete');
        listion_task_delete();
        listion_task_detail();
        listion_checkbox_complete();
        task_remind_check();
    }


    function render_task_item(data,index) {
        if(!data || !index) return;
        var comClass = '';
        data.complete && (data.complete = 'checked="checked"');
        if(data.complete){
            comClass = 'complete-item';
        }
        var list_item_tpl = '<div class="task-item '+ comClass +'" data-index="'+index+'">\
                            <span><input class="complete" '+ (data.complete ? "checked" : "") +' type="checkbox"></span>\
                            <span class="task-content">'+data.content+'</span>\
                            <span class="fr">\
                            <span class="action delete"> 删除</span>\
                            <span class="action detail"> 详细</span>\
                            </span>\
                        </div>';

        return $(list_item_tpl);

    }

    function init() {
        task_list = store.get('task_list') || [];
        if(task_list.length){
            render_task_list();
        }

        task_remind_check();
    }

    function task_remind_check() {
        var curren_time;
        setInterval(function () {
            for(var i = 0; i < task_list.length; i++){
                var task_timestamp;
                var item = task_list[i];
                if(item.informed) {
                    continue;
                }
                if(item.remind_date){
                    curren_time = (new Date()).getTime();
                    task_timestamp = (new Date(item.remind_date)).getTime();
                    if(curren_time - task_timestamp >= 1){
                        update_task(i,{informed: true});
                        alert('定时提醒 ：' + item.content);
                    }
                }
            }
        },500);

    }

})();