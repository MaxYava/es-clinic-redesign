import { Children, cloneElement, isValidElement } from "react";
import Home from "../page";
import { ContractTree } from "../ui/contract-tree";
import { ContractScrollStory } from "../ui/contract-scroll-story";

function replaceContract(node) {
  if (!isValidElement(node)) return node;
  if (node.type === ContractTree) {
    return <ContractScrollStory intro={node.props.intro} />;
  }
  if (!node.props.children) return node;
  return cloneElement(node, undefined, Children.map(node.props.children, replaceContract));
}

export default function ContractScrollPreview() {
  return replaceContract(Home());
}
