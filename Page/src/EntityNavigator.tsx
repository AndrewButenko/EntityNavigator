import React from 'react';
import { Button, DataGrid, DataGridBody, DataGridCell, DataGridRow, FluentProvider, SearchBox, Spinner, TableCellLayout, TableColumnDefinition, TableRowId, createTableColumn, makeStyles, webLightTheme } from '@fluentui/react-components';
import { CheckmarkSquare24Regular } from '@fluentui/react-icons';

interface IEntity {
  logicalName: string;
  displayName: string;
}

const useStyles = makeStyles({
  verticalStack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  horizontalStack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row'
  },
  searchBox: {
    width: '100%',
    maxWidth: '100%'
  },
  dataGrid: {
    overflowX: 'hidden',
    overflowY: 'scroll',
    height: 'calc(100vh - 50px)',
  }
});

const EntityNavigator: React.FunctionComponent = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const [selectedEntity, setSelectedEntity] = React.useState<string | undefined>(undefined);
  const [allEntities, setEntites] = React.useState<IEntity[]>([]);
  const [filteredEntities, setFilteredEntities] = React.useState<IEntity[]>([]);
  const [entityFilter, setEntityFilter] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!entityFilter) {
      setFilteredEntities(allEntities);
      return;
    }

    const filtered = allEntities.filter((entity) => {
      return entity.displayName.toLowerCase().includes(entityFilter.toLowerCase());
    });

    setFilteredEntities(filtered);
  }, [entityFilter, allEntities]);


  React.useEffect(() => {
    (async () => {
      const entitiesQuery = "/api/data/v9.0/EntityDefinitions?$filter=IsValidForAdvancedFind eq true&$select=LogicalName,DisplayName";

      const fetchResponse = await fetch(entitiesQuery);
      const responseData = await fetchResponse.json();

      const results: IEntity[] = responseData.value.map((entity: any) => {
        return {
          logicalName: entity.LogicalName,
          displayName: entity.DisplayName?.UserLocalizedLabel?.Label && entity.DisplayName?.UserLocalizedLabel?.Label !== entity.LogicalName ? `${entity.DisplayName?.UserLocalizedLabel?.Label} (${entity.LogicalName})` : entity.LogicalName
        }
      });

      results.sort((a: IEntity, b: IEntity) => {
        return ((a.displayName > b.displayName) ? 1 : (a.displayName === b.displayName ? 0 : -1));
      });

      setEntites(results);
      setIsLoaded(true);
    })();
  }, []);

  const styles = useStyles();

  if (!isLoaded) {
    return <Spinner appearance='primary' label='Loading entities, wait, please...' />;
  }

  const columns: TableColumnDefinition<IEntity>[] = [
    createTableColumn<IEntity>({
      columnId: "displayName",
      compare: (a, b) => {
        return a.displayName.localeCompare(b.displayName);
      },
      renderHeaderCell: () => {
        return "Entity";
      },
      renderCell: (item) => {
        return (
          <TableCellLayout>
            {item.displayName}
          </TableCellLayout>
        );
      },
    }),
  ];

  return (
    <>
      <FluentProvider theme={webLightTheme}>
        <div className={styles.verticalStack}>
          <div className={styles.horizontalStack}>
            <SearchBox
              className={styles.searchBox}
              onChange={(_, newValue) => {
                setEntityFilter(newValue.value);
              }}
            />
            <Button
              icon={<CheckmarkSquare24Regular />}
              disabled={!selectedEntity}
              onClick={() => {
                //@ts-ignore
                window.top.Xrm.Navigation.navigateTo({
                  pageType: 'entitylist',
                  entityName: selectedEntity
                });
              }}
            />
          </div>
          <DataGrid
            className={styles.dataGrid}
            columns={columns}
            items={filteredEntities}
            selectionMode='single'
            selectedItems={selectedEntity ? new Set([selectedEntity]) : new Set<string>()}
            getRowId={(item) => item.logicalName}
            onSelectionChange={(_, selectionChangeData) => {
              //@ts-ignore
              const selectedItems = selectionChangeData.selectedItems.values().toArray();

              if (selectedItems.length === 0) {
                setSelectedEntity(undefined);
                return;
              }

              setSelectedEntity(selectedItems[0]);
            }}
          >
            <DataGridBody<IEntity>>
              {({ item, rowId }) => (
                <DataGridRow<IEntity>
                  key={rowId}
                  selectionCell={{
                    checkboxIndicator: { "aria-label": "Select row" },
                  }}
                >
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        </div>
      </FluentProvider>
    </>);
}

export default EntityNavigator;
