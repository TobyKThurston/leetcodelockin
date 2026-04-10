class Solution:
    def suggestedProducts(self, products: list[str], searchWord: str) -> list[list[str]]:
        products = sorted(products)
        out = []
        prefix = ""
        for ch in searchWord:
            prefix += ch
            matches = [p for p in products if p.startswith(prefix)]
            out.append(matches[:3])
        return out
