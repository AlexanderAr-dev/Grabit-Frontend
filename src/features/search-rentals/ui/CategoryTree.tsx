import { FC, useMemo, useRef, useState } from 'react';
import { Box, Button, Flex, Loader, Text, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { IconChevronDown, IconChevronRight, IconX } from '@tabler/icons-react';

import { rentService } from '@shared/api';
import { BackendCategory } from '@shared/api/adapters';

interface CategoryTreeProps {
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}

interface CategoryNode extends BackendCategory {
  children: CategoryNode[];
}

function buildTree(categories: BackendCategory[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>();
  categories.forEach(c => map.set(c.id, { ...c, children: [] }));

  const roots: CategoryNode[] = [];
  map.forEach(node => {
    if (node.parent_id == null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parent_id);
      if (parent) parent.children.push(node);
    }
  });

  roots.sort((a, b) => a.sort_order - b.sort_order);
  roots.forEach(r => r.children.sort((a, b) => a.sort_order - b.sort_order));
  return roots;
}

export const CategoryTree: FC<CategoryTreeProps> = ({ selectedCategoryId, onSelect }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => rentService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const tree = useMemo(() => buildTree(categories ?? []), [categories]);

  const selectedLabel = useMemo(() => {
    if (selectedCategoryId == null) return null;
    for (const root of tree) {
      if (root.id === selectedCategoryId) return root.name;
      const child = root.children.find(c => c.id === selectedCategoryId);
      if (child) return `${root.name} → ${child.name}`;
    }
    return null;
  }, [tree, selectedCategoryId]);

  const handleSelectCategory = (id: number) => {
    onSelect(id);
    setIsOpen(false);
    setExpandedId(null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
  };

  const dropdownBg = isDark ? '#1e1e2e' : '#ffffff';
  const rowHoverBg = isDark ? '#2a2a3e' : '#f5f5f5';
  const borderColor = isDark ? '#333355' : '#e0e0e0';
  const textColor = isDark ? '#e0e0e0' : '#1a1a1a';
  const subTextColor = isDark ? '#aaaacc' : '#555577';

  return (
    <Box style={{ position: 'relative' }}>
      <Button
        ref={triggerRef}
        radius="lg"
        variant="default"
        rightSection={
          selectedCategoryId != null ? (
            <IconX size={14} onClick={handleClear} style={{ cursor: 'pointer', opacity: 0.6 }} />
          ) : (
            <IconChevronDown
              size={14}
              style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          )
        }
        onClick={() => setIsOpen(v => !v)}
        style={{
          fontWeight: selectedCategoryId != null ? 600 : 400,
          color: selectedCategoryId != null ? '#FF8104' : undefined,
          minWidth: 160,
          height: 36,
        }}
      >
        {selectedLabel ?? 'Категория'}
      </Button>

      {isLoading && isOpen && (
        <Box
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 200,
            background: dropdownBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Loader size="xs" />
        </Box>
      )}

      {isOpen && !isLoading && tree.length > 0 && (
        <Box
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 200,
            background: dropdownBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            minWidth: 260,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          {tree.map((root, idx) => {
            const isExpanded = expandedId === root.id;
            const isSelected = selectedCategoryId === root.id;
            const hasChildren = root.children.length > 0;

            return (
              <Box key={root.id}>
                {idx > 0 && (
                  <Box style={{ height: 1, background: borderColor, margin: '0 12px' }} />
                )}

                <Flex
                  align="center"
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(255,129,4,0.12)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = rowHoverBg; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <UnstyledButton
                    style={{ flex: 1, textAlign: 'left' }}
                    onClick={() => handleSelectCategory(root.id)}
                  >
                    <Text
                      size="sm"
                      fw={isSelected ? 600 : 400}
                      style={{ color: isSelected ? '#FF8104' : textColor }}
                    >
                      {root.name}
                    </Text>
                  </UnstyledButton>

                  {hasChildren && (
                    <UnstyledButton
                      onClick={() => setExpandedId(isExpanded ? null : root.id)}
                      style={{ padding: '4px 6px', borderRadius: 6, flexShrink: 0 }}
                    >
                      <IconChevronRight
                        size={16}
                        color={subTextColor}
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'block' }}
                      />
                    </UnstyledButton>
                  )}
                </Flex>

                {isExpanded && hasChildren && (
                  <Box style={{ background: isDark ? '#16162a' : '#fafafa' }}>
                    {root.children.map((child, ci) => {
                      const isChildSelected = selectedCategoryId === child.id;
                      return (
                        <Box key={child.id}>
                          {ci > 0 && (
                            <Box style={{ height: 1, background: borderColor, margin: '0 24px' }} />
                          )}
                          <Flex
                            align="center"
                            style={{
                              padding: '8px 12px 8px 28px',
                              cursor: 'pointer',
                              background: isChildSelected ? 'rgba(255,129,4,0.1)' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { if (!isChildSelected) (e.currentTarget as HTMLElement).style.background = rowHoverBg; }}
                            onMouseLeave={e => { if (!isChildSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            onClick={() => handleSelectCategory(child.id)}
                          >
                            <Text
                              size="sm"
                              fw={isChildSelected ? 600 : 400}
                              style={{ color: isChildSelected ? '#FF8104' : subTextColor }}
                            >
                              {child.name}
                            </Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
