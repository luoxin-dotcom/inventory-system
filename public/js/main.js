// // 初始化函数：页面加载后执行
// window.onload = function() {
//     loadInventory();       // 加载库存数据
//     loadBorrowRecords();   // 加载借用记录
//     setupBorrowForm();     // 绑定表单提交事件
//     populateComponents();  // 动态填充元器件下拉框
//   };
  
//   // ================== 1. 加载库存数据 ==================
//   function loadInventory() {
//     fetch('/api/inventory')
//       .then(response => {
//         if (!response.ok) throw new Error('网络响应异常');
//         return response.json();
//       })
//       .then(data => {
//         const table = document.getElementById('inventoryTable');
//         clearTableRows(table); // 清空旧数据（保留表头）
        
//         data.forEach(item => {
//           const row = table.insertRow();
//           insertCell(row, item.model);     // 型号
//           insertCell(row, item.quantity);  // 库存
//           insertCell(row, item.location);  // 位置
          
//           // 低库存警示（库存 < 最小库存时标红）
//           if (item.quantity < (item.min_stock || 5)) {
//             row.classList.add('low-stock');
//           }
//         });
//       })
//       .catch(error => {
//         console.error('加载库存失败:', error);
//         alert('加载库存失败，请刷新页面重试！');
//       });
//   }
  
//   // ================== 2. 加载借用记录 ==================
//   function loadBorrowRecords() {
//     fetch('/api/borrow-records')
//       .then(response => {
//         if (!response.ok) throw new Error('网络响应异常');
//         return response.json();
//       })
//       .then(data => {
//         const table = document.getElementById('borrowRecordsTable');
//         clearTableRows(table); // 清空旧数据
        
//         data.forEach(record => {
//           const row = table.insertRow();
//           insertCell(row, record.model);      // 型号
//           insertCell(row, record.user_name);   // 借用人
//           insertCell(row, record.quantity);    // 数量
//           insertCell(row, record.borrow_date); // 借用日期
//           insertCell(row, record.due_date);    // 到期日
          
//           // 计算剩余天数
//           const dueDate = new Date(record.due_date);
//           const diffDays = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
//           const daysCell = insertCell(row, diffDays > 0 ? `${diffDays}天` : '已到期');
          
//           // 状态标记
//           const statusCell = insertCell(row, record.status);
//           if (record.status === '超期') {
//             statusCell.style.color = 'red';
//           } else if (record.status === '损坏') {
//             statusCell.style.color = 'orange';
//           }
//         });
//       })
//       .catch(error => {
//         console.error('加载记录失败:', error);
//         alert('加载借用记录失败！');
//       });
//   }
  
//   // ================== 3. 表单提交处理 ==================
//   function setupBorrowForm() {
//     const form = document.getElementById('borrowForm');
//     form.addEventListener('submit', function(e) {
//       e.preventDefault(); // 阻止默认提交
      
//       const formData = {
//         user_name: document.getElementById('userName').value,
//         user_email: document.getElementById('userEmail').value,
//         component_id: document.getElementById('componentSelect').value,
//         quantity: parseInt(document.getElementById('quantity').value),
//         due_date: document.getElementById('dueDate').value
//       };
  
//       // 发送POST请求
//       fetch('/api/borrow', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       })
//       .then(response => {
//         if (!response.ok) throw new Error('提交失败');
//         alert('申请提交成功！');
//         form.reset();          // 清空表单
//         loadInventory();      // 刷新库存
//         loadBorrowRecords();  // 刷新记录
//       })
//       .catch(error => {
//         console.error('提交失败:', error);
//         alert('提交失败，请检查数据后重试！');
//       });
//     });
//   }
  
//   // ================== 4. 动态填充元器件下拉框 ==================
//   function populateComponents() {
//     fetch('/api/inventory')
//       .then(response => response.json())
//       .then(data => {
//         const select = document.getElementById('componentSelect');
//         data.forEach(item => {
//           const option = document.createElement('option');
//           option.value = item.id;      // 后端需要的component_id
//           option.textContent = `${item.model} (库存: ${item.quantity})`;
//           select.appendChild(option);
//         });
//       });
//   }
  
//   // ================== 工具函数 ==================
//   // 清空表格行（保留表头）
//   function clearTableRows(table) {
//     while (table.rows.length > 1) table.deleteRow(1);
//   }
  
//   // 插入单元格并填充内容
//   function insertCell(row, content) {
//     const cell = row.insertCell();
//     cell.textContent = content;
//     return cell;
//   }
  
//   // ================== 倒计时实时更新 ==================
//   setInterval(() => {
//     const rows = document.querySelectorAll('#borrowRecordsTable tr:not(:first-child)');
//     rows.forEach(row => {
//       const dueDate = new Date(row.cells[4].textContent); // 第5列是到期日
//       const diffDays = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
//       const daysCell = row.cells[5]; // 第6列显示剩余天数
//       daysCell.textContent = diffDays > 0 ? `${diffDays}天` : '已到期';
      
//       // 自动标记超期
//       const statusCell = row.cells[6];
//       if (diffDays < 0 && statusCell.textContent !== '损坏') {
//         statusCell.textContent = '超期';
//         statusCell.style.color = 'red';
//       }
//     });
//   }, 1000); // 每秒更新一次

  window.onload = function() {
    loadInventory();
    loadBorrowRecords();
    setupBorrowForm();
    populateComponents();
  };
  
  // ================== 1. 加载库存 ==================
  function loadInventory() {
    fetch('/api/inventory')
      .then(response => response.json())
      .then(data => {
        const table = document.getElementById('inventoryTable');
        clearTableRows(table);
        data.forEach(item => {
          const row = table.insertRow();
          insertCell(row, item.model);
          insertCell(row, item.quantity);
          insertCell(row, item.location);
          if (item.quantity < (item.min_stock || 5)) {
            row.classList.add('low-stock');
          }
        });
      })
      .catch(error => console.error('加载库存失败:', error));
  }
  
  // ================== 2. 加载借用记录 ==================
  function loadBorrowRecords() {
    fetch('/api/borrow-records')
      .then(response => response.json())
      .then(data => {
        const table = document.getElementById('borrowRecordsTable');
        clearTableRows(table);
        data.forEach(record => {
          const row = table.insertRow();
          insertCell(row, record.model);
          insertCell(row, record.user_name);
          insertCell(row, record.quantity);
          insertCell(row, formatDate(record.borrow_date)); // 格式化日期
          insertCell(row, formatDate(record.due_date));
          const daysCell = insertCell(row, '计算中...');
          const statusCell = insertCell(row, record.status);
          updateRowStatus(row, record.due_date, statusCell);
        });
        startTimer(); // 启动倒计时
      })
      .catch(error => console.error('加载记录失败:', error));
  }
  
  // ================== 3. 表单提交处理 ==================
  function setupBorrowForm() {
    document.getElementById('borrowForm').addEventListener('submit', e => {
      e.preventDefault();
      const data = {
        user_name: document.getElementById('userName').value,
        user_email: document.getElementById('userEmail').value,
        component_id: document.getElementById('componentSelect').value,
        quantity: document.getElementById('quantity').value,
        due_date: document.getElementById('dueDate').value,
        purpose: document.getElementById('purpose').value // 新增用途字段
      };
      fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          alert('申请提交成功！');
          loadInventory();
          loadBorrowRecords();
        } else {
          alert('提交失败，请重试！');
        }
      })
      .catch(error => console.error('提交失败:', error));
    });
  }
  
  // ================== 4. 填充元器件下拉框 ==================
  function populateComponents() {
    fetch('/api/inventory')
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById('componentSelect');
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = `${item.model} (库存: ${item.quantity})`;
          select.appendChild(option);
        });
      });
  }
  
  // ================== 工具函数 ==================
  function clearTableRows(table) {
    while (table.rows.length > 1) table.deleteRow(1);
  }
  
  function insertCell(row, content) {
    const cell = row.insertCell();
    cell.textContent = content;
    return cell;
  }
  
  function formatDate(isoString) {
    return new Date(isoString).toISOString().split('T')[0];
  }
  
  // ================== 倒计时实时更新 ==================
  function updateRowStatus(row, dueDateISO, statusCell) {
    const dueDate = new Date(dueDateISO);
    const update = () => {
      const diffDays = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
      row.cells[5].textContent = diffDays > 0 ? `${diffDays}天` : '已到期';
      if (diffDays < 0 && statusCell.textContent !== '损坏') {
        statusCell.textContent = '超期';
        statusCell.style.color = 'red';
      }
    };
    update(); // 立即执行一次
    setInterval(update, 1000); // 每秒更新
  }
  
  function startTimer() {
    setInterval(() => {
      document.querySelectorAll('#borrowRecordsTable tr:not(:first-child)').forEach(row => {
        const dueDate = new Date(row.cells[4].textContent);
        const statusCell = row.cells[6];
        updateRowStatus(row, dueDate, statusCell);
      });
    }, 1000);
  }