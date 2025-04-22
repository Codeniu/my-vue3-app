> path: src\utils\common.ts

这行代码 `import NP from 'number-precision'` 的作用是导入 number-precision 库，这是一个用于解决 JavaScript 浮点数计算精度问题的工具库。

在 JavaScript 中，由于浮点数计算的特性，经常会出现一些精度问题，比如：

```javascript
0.1 + 0.2 = 0.30000000000000004
1.0 - 0.9 = 0.09999999999999998
```

number-precision 库就是用来解决这些问题的。在当前的代码中，我们可以看到它主要用于：

1. 在第4行关闭了边界检查：

```typescript:d:\MyProjects\2025\my-vue3-app\src\utils\common.ts
NP.enableBoundaryChecking(false); // default param is true
```

2. 在 `toFixed` 函数中使用了 NP.round 方法来实现精确的数字四舍五入：

```typescript:d:\MyProjects\2025\my-vue3-app\src\utils\common.ts
export const toFixed = (v: number, digits = 2): number => NP.round(v, digits)
```

这个库的引入确保了在进行数值计算时能够得到精确的结果，避免了 JavaScript 浮点数计算中的精度损失问题。这在需要精确数值计算的场景（如金融计算、科学计算等）中特别重要。
