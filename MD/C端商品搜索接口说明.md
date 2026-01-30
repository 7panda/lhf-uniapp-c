# C 端商品搜索接口说明

## 接口概览
- 功能：商品搜索（空格分词 OR 匹配）
- URL：/no-auth/search/product/list
- 方法：POST
- 认证：不需要（no-auth）
- 返回：分页商品列表（基础信息）

---

## 搜索规则
- 使用请求体字段 `search` 作为搜索关键词。
- 关键词按空格分词。
- 商品名 + 品牌名 + 分类名 三字段 OR 模糊匹配。

---

## 请求参数

### Query 参数（可选）
| 参数名 | 类型 | 说明 |
|---|---|---|
| page | int | 页码，从 0 开始 |
| size | int | 每页条数 |
| sort | string | 排序字段，如 `id,desc` |
| dept_id | long | 部门 ID（QueryString 兜底，可不传） |

### Body（JSON）
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| search | string | 是 | 搜索关键词（支持空格分词） |
| deptId | long | 否 | 部门 ID（不传会自动兜底） |
| brandId | long | 否 | 品牌过滤 |
| categoryId | long | 否 | 分类过滤 |
| publishStatus | int | 否 | 上架状态过滤 |

---

## 请求示例（最简）
```json
{
  "search": "手机 苹果"
}
```

## 请求示例（带筛选）
```json
{
  "search": "手机 苹果",
  "brandId": 1,
  "categoryId": 100,
  "deptId": 200
}
```

---

## 返回示例
```json
{
  "content": [
    {
      "id": 1,
      "name": "商品名称",
      "pic": "图片URL",
      "price": 1000
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 100,
  "totalPages": 10
}
```

---

## 常见问题
1. 没有结果：确认关键词拼写或是否存在对应商品。
2. JSON parse error：只传需要字段，不要使用 Swagger 默认全量示例。
3. 部门过滤不生效：优先传 `deptId`，否则系统会自动兜底。
