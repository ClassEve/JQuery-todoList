/**
 * Created by Administrator on 2017/5/20.
 */

;(function () {
    'use strict';

    var $form_add_task = $('.add-task')
        ,task_list
        ;

    init();


    $form_add_task.on('submit',function (e) {
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
    });


    function add_task(new_task) {
        task_list.push(new_task);
        //更新localstorage
        store.set('task_list',task_list);

        return true;
    }


    function render_task_list() {
        var $task_list  =$(".task-list");
        $task_list.html('');
        task_list.forEach(function(val,index){
            var $render_task_item =  render_task_item(val);
            $task_list.append($render_task_item);
        });
    }

    
    function render_task_item(data) {
        var list_item_tpl = '<div class="task-item">\
                            <span><input type="checkbox"></span>\
                            <span class="task-content">'+data.content+'</span>\
                            <span class="fr">\
                            <span class="action"> 删除</span>\
                            <span class="action"> 详细</span>\
                            </span>\
                        </div>';

        return $(list_item_tpl);

    }


    function init() {
        task_list = store.get('task_list') || [];
        if(task_list.length){
            render_task_list();
        }
    }

})();