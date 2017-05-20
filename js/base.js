/**
 * Created by Administrator on 2017/5/20.
 */

;(function () {
    'use strict';

    var $form_add_task = $('.add-task'),
        
        $delete_task,
        task_list,
        $task_detail = $(".task-detail"),
        $task_detail_mask = $(".task-detail-mask")
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

    function listion_task_delete() {
        $delete_task.on('click',function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');
            var tmp = confirm('确定删除');
            tmp ? delete_task(index) : null;
        });
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
        delete task_list[index];
        refresh_task_list();

    }





    function render_task_list() {
        var $task_list  =$(".task-list");
        $task_list.html('');
        task_list.forEach(function(val,index){
            var $render_task_item =  render_task_item(val,index);
            $task_list.append($render_task_item);
        });

       $delete_task = $(".action.delete");
        listion_task_delete();
    }


    function render_task_item(data,index) {
        if(!data || !index) return;
        var list_item_tpl = '<div class="task-item" data-index="'+index+'">\
                            <span><input type="checkbox"></span>\
                            <span class="task-content">'+data.content+'</span>\
                            <span class="fr">\
                            <span class="action delete"> 删除</span>\
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
        listion_task_delete();
    }

})();