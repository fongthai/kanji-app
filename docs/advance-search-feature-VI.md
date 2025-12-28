# Advanced Search - Kanji Query Language (KQL)

## Tổng quan

Tính năng Advanced Search giới thiệu **Kanji Query Language (KQL)**, một query language mạnh mẽ cho phép người dùng tìm kiếm kanji bằng cách sử dụng field prefixes, logical operators, comparison operators và complex queries. Tính năng này được thiết kế cho cả người mới bắt đầu (qua giao diện Quick Filters) và người dùng nâng cao (qua syntax KQL).

## Giao diện Người dùng

Giao diện tìm kiếm sử dụng **thiết kế inline tối giản** để đơn giản và hiệu quả:

### Search Box 🔍
- Trường input đơn với auto-complete
- **Real-time syntax highlighting** với color-coded prefixes, operators, và values
- **Progressive error validation**:
  - Typing: Không hiển thị errors (non-intrusive)
  - On Blur: Syntax check với position indicator
  - On Enter: Full validation với popup warning
- **Visual error feedback**:
  - Red underline tại error position
  - Warning popup với error details (auto-hide sau 3s)
  - Shake animation chỉ khi execution
- Thực thi debounced (300ms) để tối ưu performance
- Lịch sử tìm kiếm được lưu trong localStorage (tối đa 10)

### Quick Filter Chips ⚡
- Các filter chips được định nghĩa sẵn bên dưới search box
- Filter một cú nhấp chuột cho các query phổ biến:
  - **JLPT Level**: N5, N4, N3
  - **Frequency**: Kanji phổ biến (freq:<500)
  - **Recent**: Kanji của năm (koty:2025)
- Click chip để apply filter ngay lập tức
- Trạng thái active trực quan khi filter được apply

### Rotating Examples
- Các query examples hữu ích rotate mỗi 5 giây
- Click vào bất kỳ example nào để populate search box
- Các examples bao gồm các use cases phổ biến:
  - Search theo âm Hán Việt
  - Search theo nghĩa English
  - Kết hợp nhiều criteria
  - Filter theo JLPT level và frequency

### Saved Queries
- Button save (💾) để lưu trữ query hiện tại
- Button load (📚) để truy cập các saved queries
- Tối đa 10 saved queries (localStorage)
- Custom name cho mỗi saved query
- Tính năng xóa nhanh

## Cú pháp KQL

### Field Prefixes

Search các fields cụ thể bằng prefix:

| Prefix | Alias | Field | Example |
|--------|-------|-------|--------|
| `char:` | `kanji:` | Ký tự Kanji | `char:行` |
| `hanviet:` | `hv:` | Âm Hán Việt | `hanviet:HÀNH` |
| `en:` | `english:` | Nghĩa English | `en:"to go"` |
| `vn:` | `vietnamese:` | Nghĩa Vietnamese | `vn:đi` |
| `on:` | `onyomi:` | Âm đọc Onyomi | `on:コウ` |
| `kun:` | `kunyomi:` | Âm đọc Kunyomi | `kun:い` |
| `com:` | `component:` | Component/Radical | `com:行` |
| `jlpt:` | - | JLPT Level | `jlpt:N5` |
| `freq:` | `frequency:` | Frequency Rank | `freq:<100` |

**Default Search**: Nếu không chỉ định prefix, KQL sẽ search trên các fields `kanji`, `sinoViet`, `meaning` và `vietnameseMeaning`.

### Logical Operators

Kết hợp nhiều conditions:

| Operator | Alias | Mô tả | Example |
|----------|-------|-------|--------|
| `AND` | `&` | Cả hai conditions phải đúng | `jlpt:N5 AND freq:<500` |
| `OR` | <code>&#124;</code> | Ít nhất một condition phải đúng | `jlpt:N5 OR jlpt:N4` |
| `NOT` | `!` | Loại trừ results khớp với condition | `NOT jlpt:N5` |
| `( )` | - | Nhóm conditions cho logic phức tạp | `(jlpt:N5 OR jlpt:N4) AND freq:<500` |

### Comparison Operators

Sử dụng với prefix `freq:` và `jlpt:`:

| Operator | Mô tả | Example |
|----------|-------|--------|
| `<` | Nhỏ hơn | `freq:<100` hoặc `jlpt:<N3` |
| `>` | Lớn hơn | `freq:>1000` hoặc `jlpt:>N3` |
| `<=` | Nhỏ hơn hoặc bằng | `freq:<=500` hoặc `jlpt:<=N4` |
| `>=` | Lớn hơn hoặc bằng | `freq:>=100` hoặc `jlpt:>=N2` |
| `min-max` | Range (inclusive) | `freq:100-500` |

**Thứ tự JLPT Level**: N5 (dễ nhất) < N4 < N3 < N2 < N1 (khó nhất)
- `jlpt:>N3` trả về kanji N2 và N1 (nâng cao hơn)
- `jlpt:<N3` trả về kanji N4 và N5 (dễ hơn)

### Special Features

- **Exact Match**: Sử dụng dấu ngoặc kép cho exact phrase match: `en:"to go"`
- **Case-insensitive**: Tất cả searches không phân biệt hoa thường (trừ bên trong quotes)
- **Auto-complete**: Nhấn `Tab` hoặc `Enter` để accept suggestion
- **Keyboard Navigation**: `↑↓` để navigate suggestions, `Esc` để đóng
- **Result Limit**: Trả về 50 results phù hợp nhất

## Ví dụ Truy vấn

### Ví dụ Cơ bản

```kql
# Tìm tất cả kanji N5
jlpt:N5

# Tìm kanji có âm Hán Việt "HÀNH"
hanviet:HÀNH

# Tìm kanji rất phổ biến (thứ hạng tần suất ≤ 100)
freq:<=100

# Tìm kanji có nghĩa "to go"
en:"to go"
```

### Ví dụ Trung cấp

```kql
# Kanji N5 phổ biến
jlpt:N5 AND freq:<500

# Kanji N5 hoặc N4 có âm onyomi "コウ"
(jlpt:N5 OR jlpt:N4) AND on:コウ

# Kanji có tần suất từ 100-500
freq:100-500

# Kanji liên quan đến thời gian ở cấp N5
Time AND jlpt:N5

# Kanji cấp độ nâng cao (N2 hoặc khó hơn)
jlpt:>=N2
```

### Ví dụ Nâng cao

```kql
# Kanji phổ biến KHÔNG có trong N5
freq:<500 AND NOT jlpt:N5

# Kanji N3 chứa thành phần "行"
jlpt:N3 AND com:行

# Kanji có âm HÀNH hoặc HẠNH
hanviet:HÀNH OR hanviet:HẠNH

# Gói toàn diện cho người mới bắt đầu
(jlpt:N5 OR jlpt:N4) AND freq:<=800

# Kanji N3 khó
jlpt:N3 AND freq:>1000

# Tất cả kanji thân thiện với người mới (N4 và N5)
jlpt:<=N4

# Kanji nâng cao với thành phần cụ thể
jlpt:>N3 AND com:行
```

## Implementation Architecture

### Parsing Pipeline

1. **Tokenizer** (`KQLTokenizer`): Chuyển đổi query string thành tokens
   - Nhận dạng prefixes, operators, quoted strings, numbers, ranges
   - Xử lý special characters: `()`, `&`, `|`, `!`, `<`, `>`, `"`
   - Track position để error reporting

2. **Parser** (`KQLParser`): Xây dựng Abstract Syntax Tree (AST)
   - Recursive descent parser
   - Operator precedence: `()` > `NOT` > `AND` > `OR`
   - Collect errors với position và context

3. **Evaluator** (`KQLEvaluator`): Execute AST đối với kanji data
   - Tree traversal với short-circuit evaluation
   - Field-specific matching (exact/contains, arrays, numbers)
   - Result limit (top 50)

### Data Flow

```
User Input → Tokenizer → Parser → AST → Evaluator → Results
               ↓           ↓                        ↓
            Tokens      Errors            Filtered Kanjis
```

### State Management

- **Search State**: Local state trong component `MinimalSearch`
  - Query string
  - Suggestions array
  - Errors array
  - Recent searches (persisted vào localStorage)

- **Kanji State**: Redux `kanjiSlice`
  - `allKanjis`: Full kanji dataset từ IndexedDB
  - `chosenKanjis`: User-selected kanjis

- **UI State**: Local state trong component `KanjiSearch`
  - Active chips
  - Search results
  - Toast messages

## Field Mapping

KQL prefixes map đến `KanjiData` interface fields:

| KQL Prefix | TypeScript Field | JSON Field | Type |
|------------|------------------|------------|------|
| `char:` | `kanji` | `character` | `string` |
| `hanviet:` | `sinoViet` | `han-viet` | `string` |
| `en:` | `meaning` | `english-meaning` | `string` |
| `vn:` | `vietnameseMeaning` | `vietnamese-meaning` | `string` |
| `on:` | `onyomi` | `onyomi` | `string[]` |
| `kun:` | `kunyomi` | `kunyomi` | `string[]` |
| `com:` | `components` | `components` | `string` |
| `jlpt:` | `jlptLevel` | `jlpt-level` | `string` |
| `freq:` | `frequency` | `frequency` | `number` |

**Note**: Data conversion từ kebab-case JSON sang camelCase TypeScript xảy ra trong `src/db/indexedDB.ts` trong function `seedKanjisFromJSON`.

## Performance Considerations

### Optimization Strategies

1. **Debounced Execution**: Delay 300ms sau khi user ngừng typing
2. **Result Limiting**: Chỉ top 50 results (ngăn UI overload)
3. **Query Caching**: Recent searches được cache trong localStorage
4. **Short-circuit Evaluation**: Operators `AND`/`OR` stop sớm khi possible
5. **Memoization**: `useMemo` cho expensive calculations trong React components

### Memory Management

- **Recent Searches**: Max 10 items (auto-trim oldest)
- **Saved Queries**: Max 10 items (enforced on save)
- **Search Results**: Limited ở 50 items
- **LocalStorage Usage**: ~1-2 KB cho search history

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **IndexedDB**: Required để store kanji data
- **LocalStorage**: Required cho history/saved queries
- **ES6+ Features**: Optional chaining, nullish coalescing, arrow functions

## Future Improvements

### Planned Features

1. **Preset Queries**: Load pre-defined queries từ `src/utils/kql/presets.json`
2. **Query Builder UI**: Visual query building (drag-and-drop)
3. **Regex Support**: Pattern matching trong text fields
4. **Fuzzy Search**: Approximate matching cho typos
5. **Search History Analytics**: Most-used prefixes/operators
6. **Export Search Results**: CSV/JSON export của filtered kanjis
7. **Shareable Queries**: URL parameter encoding để share queries

### Potential Enhancements

- **Syntax Highlighting**: Full syntax highlighting (hiện tại basic)
- **Performance**: Web Workers để parse large queries
- **Accessibility**: ARIA labels, keyboard-only navigation
- **Mobile UX**: Swipe gestures, haptic feedback
- **Internationalization**: Multi-language UI (i18n feature deferred)

## Testing

### Unit Tests

```bash
npm test -- kqlParser.test.ts
```

Test coverage bao gồm:
- Tokenizer: Tất cả token types, error cases
- Parser: Operator precedence, grouping, errors
- Evaluator: Tất cả comparison operators, field matching

### E2E Tests

```bash
npm run test:e2e -- advanced-search.spec.ts
```

Test scenarios:
- Tab navigation
- Query execution
- Auto-complete
- Saved queries
- Error handling

## Troubleshooting

### Common Issues

**Q: Auto-complete không hoạt động**
- Đảm bảo cursor ở cuối word
- Check syntax errors (red underline)
- Thử typing prefix theo sau colon (e.g., `han:`)

**Q: No results found**
- Verify JLPT level format (N5, không phải n5 hoặc N-5)
- Check comparison operators (use `<` không phải `less than`)
- Thử broaden search (remove một số conditions)

**Q: Saved queries biến mất**
- Check localStorage quota (browser limit: ~5MB)
- Clearing browser cache có thể xóa saved queries
- Export important queries ra text file

**Q: Performance chậm**
- Reduce result count bằng cách add more filters
- Clear recent searches (clean up localStorage)
- Check browser console để tìm errors

## Xem thêm

- [Yêu cầu Dự án](./project-requirements.md) - Yêu cầu tính năng gốc
- [Tài liệu Tùy chọn UI](./20251227-advanced-search-ui-options.md) - Các lựa chọn thiết kế
- [Mã nguồn KQL Parser](../src/utils/kqlParser.ts) - Chi tiết triển khai
- [Mã nguồn Tab Tìm kiếm](../src/features/search/SearchTab.tsx) - Component UI chính
