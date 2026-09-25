/**
 * React + Google Translate DOM Reconciler Patch.
 *
 * Problem:
 * When Google Translate / Browser Translation plugins translate web pages, they mutate
 * the real DOM by replacing raw TextNodes with <font> tags. When React subsequently
 * attempts to re-render, unmount, or transition elements, React's DOM reconciler calls
 * `parent.removeChild(child)` or `parent.insertBefore(new, ref)`.
 * Because the DOM hierarchy was modified by the translator, the browser throws:
 * "NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
 *
 * Solution:
 * Safely guard `Node.prototype.removeChild` and `Node.prototype.insertBefore` so that
 * when a child's `parentNode` does not match `this`, it is handled gracefully without
 * crashing the React application.
 */

export const DOM_TRANSLATE_PATCH_SCRIPT = `(function() {
  try {
    if (typeof Node === 'function' && Node.prototype) {
      var origRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function(child) {
        if (child.parentNode !== this) {
          if (child.parentNode) {
            return child.parentNode.removeChild(child);
          }
          return child;
        }
        return origRemoveChild.apply(this, arguments);
      };

      var origInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function(newNode, refNode) {
        if (refNode && refNode.parentNode !== this) {
          if (refNode.parentNode) {
            return refNode.parentNode.insertBefore(newNode, refNode);
          }
          return this.appendChild(newNode);
        }
        return origInsertBefore.apply(this, arguments);
      };
    }
  } catch (e) {}
})();`;

if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  try {
    const origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) {
          return child.parentNode.removeChild(child) as T;
        }
        return child;
      }
      return origRemoveChild.apply(this, [child]) as T;
    };

    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
      if (refNode && refNode.parentNode !== this) {
        if (refNode.parentNode) {
          return refNode.parentNode.insertBefore(newNode, refNode) as T;
        }
        return this.appendChild(newNode) as T;
      }
      return origInsertBefore.apply(this, [newNode, refNode]) as T;
    };
  } catch {}
}
